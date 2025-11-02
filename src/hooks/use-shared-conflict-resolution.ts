'use client';

import { useState, useCallback } from 'react';
import * as React from 'react';
import usePartySocket from 'partysocket/react';
import type { AnalysisData } from '@/types/analysis';
import { featureFlags } from '@/lib/config/features';
import { toast } from 'sonner';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('ConflictResolution');

// Configuration
const ACK_TIMEOUT_MS = 5000; // 5 seconds
const MAX_RETRIES = 3;
const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds - send ping
const HEARTBEAT_TIMEOUT_MS = 40000; // 40 seconds - expect pong

interface SharedSelection {
  field: keyof AnalysisData;
  value: unknown;
  userId: string;
  userName: string;
  timestamp: number;
}

interface ConflictResolutionMessage {
  type:
    | 'field_selected'
    | 'sync_request'
    | 'sync_response'
    | 'user_joined'
    | 'user_ready'
    | 'user_left'
    | 'room_full'
    | 'ack' // Message acknowledgment
    | 'ping' // Heartbeat ping
    | 'pong'; // Heartbeat pong
  selection?: SharedSelection;
  selections?: Record<string, SharedSelection>;
  userId?: string;
  userName?: string;
  isReady?: boolean;
  message?: string;
  maxParticipants?: number;
  messageId?: string; // Unique ID for message tracking
  ackFor?: string; // ID of message being acknowledged
  timestamp?: number; // For heartbeat timing
}

interface Participant {
  id: string;
  name: string;
  isReady: boolean;
}

export function useSharedConflictResolution(
  transactionId: string,
  userId: string,
  userName: string
) {
  const [sharedSelections, setSharedSelections] = useState<
    Partial<Record<keyof AnalysisData, SharedSelection>>
  >({});
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [otherPartyDisconnected, setOtherPartyDisconnected] = useState(false);

  // Message acknowledgment tracking
  const pendingMessagesRef = React.useRef<
    Map<
      string,
      {
        message: ConflictResolutionMessage;
        timestamp: number;
        retries: number;
      }
    >
  >(new Map());
  const ackTimeoutRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map());
  const socketRef = React.useRef<ReturnType<typeof usePartySocket> | null>(
    null
  );

  // Heartbeat tracking
  const heartbeatIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastPongReceivedRef = React.useRef<number>(Date.now());

  const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';

  // Generate unique message ID
  const generateMessageId = useCallback(() => {
    return `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, [userId]);

  // Start heartbeat monitoring
  const startHeartbeat = useCallback(() => {
    logger.log('Starting heartbeat monitoring');

    // Clear any existing intervals
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }

    lastPongReceivedRef.current = Date.now();

    // Send ping every 30 seconds
    heartbeatIntervalRef.current = setInterval(() => {
      const socket = socketRef.current;
      if (!socket) return;

      const now = Date.now();
      const timeSinceLastPong = now - lastPongReceivedRef.current;

      // Check if connection is stale (no pong for 40 seconds)
      if (timeSinceLastPong > HEARTBEAT_TIMEOUT_MS) {
        logger.warn('Connection appears stale - no pong received');
        toast.error('Connection lost', {
          description: 'Attempting to reconnect...',
        });

        // Force reconnection by closing socket
        socket.close();
        return;
      }

      // Send ping
      logger.log('Sending heartbeat ping');
      socket.send(
        JSON.stringify({
          type: 'ping',
          timestamp: now,
        } as ConflictResolutionMessage)
      );
    }, HEARTBEAT_INTERVAL_MS);
  }, []);

  // Stop heartbeat monitoring
  const stopHeartbeat = useCallback(() => {
    logger.log('Stopping heartbeat monitoring');

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  // Send message with acknowledgment and retry logic
  const sendMessageWithAck = useCallback(
    (message: ConflictResolutionMessage, requireAck: boolean = true) => {
      const socket = socketRef.current;
      if (!socket) {
        logger.warn('Cannot send message - socket not available');
        return;
      }

      const messageId = requireAck ? generateMessageId() : undefined;
      const messageWithId = { ...message, messageId };

      // Send the message
      socket.send(JSON.stringify(messageWithId));
      logger.log('Sent message:', messageWithId.type, 'ID:', messageId);

      // If acknowledgment required, set up retry logic
      if (requireAck && messageId) {
        pendingMessagesRef.current.set(messageId, {
          message: messageWithId,
          timestamp: Date.now(),
          retries: 0,
        });

        const scheduleRetry = (msgId: string, retryCount: number) => {
          const timeout = setTimeout(() => {
            const pending = pendingMessagesRef.current.get(msgId);

            if (!pending) return; // Already acknowledged

            if (retryCount >= MAX_RETRIES) {
              logger.error('Message delivery failed after retries:', msgId);
              pendingMessagesRef.current.delete(msgId);
              ackTimeoutRef.current.delete(msgId);

              // Show error to user for critical messages
              if (message.type === 'field_selected') {
                toast.error(
                  'Connection issue - your selection may not have been saved',
                  {
                    description:
                      'Please check your internet connection and try again',
                  }
                );
              }
              return;
            }

            // Retry sending
            logger.warn(
              `Retrying message ${msgId} (attempt ${retryCount + 1}/${MAX_RETRIES})`
            );
            const currentSocket = socketRef.current;
            if (currentSocket) {
              currentSocket.send(JSON.stringify(pending.message));
            }

            pending.retries = retryCount + 1;
            scheduleRetry(msgId, retryCount + 1);
          }, ACK_TIMEOUT_MS);

          ackTimeoutRef.current.set(msgId, timeout);
        };

        scheduleRetry(messageId, 0);
      }
    },
    [generateMessageId]
  );

  // Use message handler callback
  const handleMessage = useCallback(
    (evt: MessageEvent) => {
      logger.log('Received message:', evt.data);

      // Convert data to string synchronously if possible
      const data = evt.data;

      // Skip if data is Blob - we'll handle string messages only
      if (data instanceof Blob) {
        logger.log('Skipping Blob message');
        return;
      }

      // Must be a string at this point
      if (typeof data !== 'string') {
        logger.log('Skipping non-string message:', typeof data);
        return;
      }

      // Skip empty strings
      if (!data || data.trim() === '') {
        logger.log('Skipping empty message');
        return;
      }

      try {
        const message: ConflictResolutionMessage = JSON.parse(data);
        logger.log('Parsed message:', message);

        // Handle ping - respond with pong
        if (message.type === 'ping') {
          const socket = socketRef.current;
          if (socket) {
            socket.send(
              JSON.stringify({
                type: 'pong',
                timestamp: Date.now(),
              } as ConflictResolutionMessage)
            );
          }
          return;
        }

        // Handle pong - update last received time
        if (message.type === 'pong') {
          logger.log('Received pong');
          lastPongReceivedRef.current = Date.now();
          return;
        }

        // Handle acknowledgments
        if (message.type === 'ack' && message.ackFor) {
          logger.log('Received ACK for message:', message.ackFor);

          // Clear pending message and timeout
          pendingMessagesRef.current.delete(message.ackFor);

          const timeout = ackTimeoutRef.current.get(message.ackFor);
          if (timeout) {
            clearTimeout(timeout);
            ackTimeoutRef.current.delete(message.ackFor);
          }

          return; // Don't process ack further
        }

        // Send acknowledgment for messages that have messageId
        if (message.messageId && socketRef.current) {
          socketRef.current.send(
            JSON.stringify({
              type: 'ack',
              ackFor: message.messageId,
            } as ConflictResolutionMessage)
          );
        }

        switch (message.type) {
          case 'field_selected':
            if (message.selection) {
              logger.log(
                '[ConflictResolution] Updating selection:',
                message.selection.field
              );
              setSharedSelections((prev) => {
                const existing = prev[message.selection!.field];

                // Conflict resolution: timestamp + userId tiebreaker
                const shouldUpdate =
                  !existing ||
                  message.selection!.timestamp > existing.timestamp ||
                  (message.selection!.timestamp === existing.timestamp &&
                    message.selection!.userId > existing.userId);

                if (shouldUpdate) {
                  logger.log(
                    '[ConflictResolution] Accepting selection:',
                    message.selection!.field,
                    'timestamp:',
                    message.selection!.timestamp,
                    'userId:',
                    message.selection!.userId
                  );
                  return {
                    ...prev,
                    [message.selection!.field]: message.selection!,
                  };
                }

                // Ignore older or lower-priority selections
                logger.log('Ignoring selection:', {
                  field: message.selection!.field,
                  existingTimestamp: existing.timestamp,
                  existingUserId: existing.userId,
                  incomingTimestamp: message.selection!.timestamp,
                  incomingUserId: message.selection!.userId,
                });
                return prev;
              });
            }
            break;

          case 'sync_response':
            if (message.selections) {
              logger.log(
                '[ConflictResolution] Syncing selections:',
                message.selections
              );
              setSharedSelections(message.selections);
            }
            break;

          case 'user_joined':
            if (message.userId && message.userName) {
              logger.log('[ConflictResolution] User joined:', message.userName);
              const { userId: joinedUserId, userName: joinedUserName } =
                message;
              setParticipants((prev) => {
                const exists = prev.find((p) => p.id === joinedUserId);
                if (exists) return prev;
                return [
                  ...prev,
                  {
                    id: joinedUserId,
                    name: joinedUserName,
                    isReady: false,
                  },
                ];
              });
            }
            break;

          case 'user_ready':
            if (message.userId && message.isReady !== undefined) {
              logger.log(
                '[ConflictResolution] User ready status:',
                message.userId,
                message.isReady
              );
              const {
                userId: readyUserId,
                userName: readyUserName,
                isReady: readyStatus,
              } = message;
              setParticipants((prev) => {
                // Check if user exists in participants
                const userExists = prev.find((p) => p.id === readyUserId);

                if (!userExists) {
                  logger.log(
                    '[ConflictResolution] User not in participants, adding:',
                    readyUserId
                  );
                  // Add the user if they don't exist
                  return [
                    ...prev,
                    {
                      id: readyUserId,
                      name: readyUserName ?? 'Other party',
                      isReady: readyStatus ?? false,
                    },
                  ];
                }

                // Update existing user
                const updated = prev.map((p) =>
                  p.id === readyUserId
                    ? { ...p, isReady: readyStatus ?? false }
                    : p
                );
                logger.log(
                  '[ConflictResolution] Updated participants:',
                  updated
                );
                return updated;
              });
            }
            break;

          case 'user_left':
            if (message.userId && featureFlags.enableDisconnectWarning) {
              logger.log('User left:', message.userId);
              const leftUserId = message.userId;

              // Check if it's not the current user who left
              if (leftUserId !== userId) {
                logger.log('[ConflictResolution] ⚠️ Other party disconnected!');
                setOtherPartyDisconnected(true);
              }

              // Remove user from participants
              setParticipants((prev) =>
                prev.filter((p) => p.id !== leftUserId)
              );
            }
            break;

          case 'room_full':
            logger.log(
              '[ConflictResolution] ❌ Room is full:',
              message.message
            );
            toast.error(message.message || 'This transaction room is full.', {
              duration: 10000,
              description: `Maximum ${message.maxParticipants || 2} participants allowed per transaction.`,
            });
            // Connection will be closed by server
            break;
        }
      } catch (error) {
        logger.error(
          '[ConflictResolution] Parse error:',
          error,
          'Raw data:',
          data
        );
      }
    },
    [userId]
  ); // Include userId to avoid stale closure

  const socket = usePartySocket({
    host,
    party: 'collaboration',
    room: `conflict-resolution:${transactionId}`,
    onOpen() {
      logger.log('Connected to PartyKit');
      setIsConnected(true);

      // Skip announcing presence if userId is empty (still loading auth)
      if (!userId || userId === '') {
        logger.log(
          '[ConflictResolution] Skipping user_joined - userId not ready'
        );
        return;
      }

      // Add self to participants immediately (won't receive own broadcast)
      setParticipants((prev) => {
        const exists = prev.find((p) => p.id === userId);
        if (exists) return prev;
        logger.log(
          '[ConflictResolution] Adding self to participants:',
          userName
        );
        return [...prev, { id: userId, name: userName, isReady: false }];
      });

      // Announce presence to others (no ack needed for join)
      sendMessageWithAck(
        {
          type: 'user_joined',
          userId,
          userName,
        },
        false
      );

      // Request current state sync (no ack needed)
      sendMessageWithAck(
        {
          type: 'sync_request',
        },
        false
      );

      // Start heartbeat monitoring
      startHeartbeat();
    },
    onMessage: handleMessage,
    onClose() {
      logger.log('Disconnected from PartyKit');
      setIsConnected(false);

      // Stop heartbeat monitoring
      stopHeartbeat();

      // Remove self from participants (server broadcasts user_left to others)
      setParticipants((prev) => prev.filter((p) => p.id !== userId));

      // Server will broadcast user_left message to other participants
    },
    onError(error) {
      logger.error('Socket error:', error);
    },
  });

  // Store socket ref for use in sendMessageWithAck
  React.useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopHeartbeat();

      // Clear all pending message timeouts

      ackTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ackTimeoutRef.current.clear();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      pendingMessagesRef.current.clear();
    };
  }, [stopHeartbeat]);

  const selectField = useCallback(
    (field: keyof AnalysisData, value: unknown) => {
      const selection: SharedSelection = {
        field,
        value,
        userId,
        userName,
        timestamp: Date.now(),
      };

      logger.log(
        '[ConflictResolution] Selecting field:',
        field,
        'value:',
        value
      );

      // Optimistic update with conflict check
      setSharedSelections((prev) => {
        const existing = prev[field];

        // Conflict resolution: timestamp + userId tiebreaker
        const shouldUpdate =
          !existing ||
          selection.timestamp > existing.timestamp ||
          (selection.timestamp === existing.timestamp &&
            selection.userId > existing.userId);

        if (shouldUpdate) {
          logger.log(
            '[ConflictResolution] Applying optimistic update for:',
            field
          );
          return {
            ...prev,
            [field]: selection,
          };
        }

        // Don't overwrite higher-priority selection
        logger.warn(
          '[ConflictResolution] Skipping optimistic update - existing selection has priority'
        );
        return prev;
      });

      // Broadcast to other participants with acknowledgment
      sendMessageWithAck(
        {
          type: 'field_selected',
          selection,
        },
        true
      ); // Require ACK for field selections (critical data)
    },
    [sendMessageWithAck, userId, userName]
  );

  const getFieldSelection = useCallback(
    (field: keyof AnalysisData): SharedSelection | undefined => {
      return sharedSelections[field];
    },
    [sharedSelections]
  );

  const hasSelection = useCallback(
    (field: keyof AnalysisData): boolean => {
      return !!sharedSelections[field];
    },
    [sharedSelections]
  );

  const isFieldSelectedByOther = useCallback(
    (field: keyof AnalysisData): boolean => {
      const selection = sharedSelections[field];
      return !!selection && selection.userId !== userId;
    },
    [sharedSelections, userId]
  );

  const setUserReady = useCallback(
    (isReady: boolean) => {
      logger.log('Setting user ready:', userId, isReady);

      // Update local participant state
      setParticipants((prev) => {
        const updated = prev.map((p) =>
          p.id === userId ? { ...p, isReady } : p
        );
        logger.log('[ConflictResolution] Updated local participants:', updated);
        return updated;
      });

      // Broadcast ready status (critical for flow coordination)
      sendMessageWithAck(
        {
          type: 'user_ready',
          userId,
          isReady,
        },
        true
      );
    },
    [sendMessageWithAck, userId]
  );

  const allParticipantsReady = useCallback(() => {
    const ready =
      participants.length >= 2 && participants.every((p) => p.isReady);
    logger.log('All ready check:', {
      participantCount: participants.length,
      participants,
      allReady: ready,
    });
    return ready;
  }, [participants]);

  return {
    sharedSelections,
    participants,
    isConnected,
    otherPartyDisconnected,
    selectField,
    getFieldSelection,
    hasSelection,
    isFieldSelectedByOther,
    setUserReady,
    allParticipantsReady,
  };
}
