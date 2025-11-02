'use client';

import { useState, useCallback } from 'react';
import usePartySocket from 'partysocket/react';
import type { AnalysisData } from '@/types/analysis';
import { featureFlags } from '@/lib/config/features';
import { toast } from 'sonner';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('ConflictResolution');

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
    | 'room_full';
  selection?: SharedSelection;
  selections?: Record<string, SharedSelection>;
  userId?: string;
  userName?: string;
  isReady?: boolean;
  message?: string;
  maxParticipants?: number;
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

  const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';

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

      // Announce presence to others
      socket.send(
        JSON.stringify({
          type: 'user_joined',
          userId,
          userName,
        } as ConflictResolutionMessage)
      );

      // Request current state sync
      socket.send(
        JSON.stringify({
          type: 'sync_request',
        } as ConflictResolutionMessage)
      );
    },
    onMessage: handleMessage,
    onClose() {
      logger.log('Disconnected from PartyKit');
      setIsConnected(false);

      // Remove self from participants (server broadcasts user_left to others)
      setParticipants((prev) => prev.filter((p) => p.id !== userId));

      // Server will broadcast user_left message to other participants
    },
    onError(error) {
      logger.error('Socket error:', error);
    },
  });

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

      // Broadcast to other participants
      if (socket) {
        const message = JSON.stringify({
          type: 'field_selected',
          selection,
        } as ConflictResolutionMessage);

        logger.log('Sending message:', message);
        socket.send(message);
      } else {
        logger.warn('Socket not available');
      }
    },
    [socket, userId, userName]
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

      // Broadcast ready status
      if (socket) {
        const message = JSON.stringify({
          type: 'user_ready',
          userId,
          isReady,
        } as ConflictResolutionMessage);
        logger.log('Broadcasting ready status:', message);
        socket.send(message);
      }
    },
    [socket, userId]
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
