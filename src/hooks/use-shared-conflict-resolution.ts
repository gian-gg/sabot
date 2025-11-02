'use client';

import { useState, useCallback } from 'react';
import usePartySocket from 'partysocket/react';
import type { AnalysisData } from '@/types/analysis';
import { featureFlags } from '@/lib/config/features';
import { toast } from 'sonner';

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
      console.log('[ConflictResolution] Received message:', evt.data);

      // Convert data to string synchronously if possible
      const data = evt.data;

      // Skip if data is Blob - we'll handle string messages only
      if (data instanceof Blob) {
        console.log('[ConflictResolution] Skipping Blob message');
        return;
      }

      // Must be a string at this point
      if (typeof data !== 'string') {
        console.log(
          '[ConflictResolution] Skipping non-string message:',
          typeof data
        );
        return;
      }

      // Skip empty strings
      if (!data || data.trim() === '') {
        console.log('[ConflictResolution] Skipping empty message');
        return;
      }

      try {
        const message: ConflictResolutionMessage = JSON.parse(data);
        console.log('[ConflictResolution] Parsed message:', message);

        switch (message.type) {
          case 'field_selected':
            if (message.selection) {
              console.log(
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
                  console.log(
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
                console.log('[ConflictResolution] Ignoring selection:', {
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
              console.log(
                '[ConflictResolution] Syncing selections:',
                message.selections
              );
              setSharedSelections(message.selections);
            }
            break;

          case 'user_joined':
            if (message.userId && message.userName) {
              console.log(
                '[ConflictResolution] User joined:',
                message.userName
              );
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
              console.log(
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
                  console.log(
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
                console.log(
                  '[ConflictResolution] Updated participants:',
                  updated
                );
                return updated;
              });
            }
            break;

          case 'user_left':
            if (message.userId && featureFlags.enableDisconnectWarning) {
              console.log('[ConflictResolution] User left:', message.userId);
              const leftUserId = message.userId;

              // Check if it's not the current user who left
              if (leftUserId !== userId) {
                console.log(
                  '[ConflictResolution] ⚠️ Other party disconnected!'
                );
                setOtherPartyDisconnected(true);
              }

              // Remove user from participants
              setParticipants((prev) =>
                prev.filter((p) => p.id !== leftUserId)
              );
            }
            break;

          case 'room_full':
            console.log(
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
        console.error(
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
      console.log('[ConflictResolution] Connected to PartyKit');
      setIsConnected(true);

      // Skip announcing presence if userId is empty (still loading auth)
      if (!userId || userId === '') {
        console.log(
          '[ConflictResolution] Skipping user_joined - userId not ready'
        );
        return;
      }

      // Add self to participants immediately (won't receive own broadcast)
      setParticipants((prev) => {
        const exists = prev.find((p) => p.id === userId);
        if (exists) return prev;
        console.log(
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
      console.log('[ConflictResolution] Disconnected from PartyKit');
      setIsConnected(false);

      // Remove self from participants (server broadcasts user_left to others)
      setParticipants((prev) => prev.filter((p) => p.id !== userId));

      // Server will broadcast user_left message to other participants
    },
    onError(error) {
      console.error('[ConflictResolution] Socket error:', error);
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

      console.log(
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
          console.log(
            '[ConflictResolution] Applying optimistic update for:',
            field
          );
          return {
            ...prev,
            [field]: selection,
          };
        }

        // Don't overwrite higher-priority selection
        console.warn(
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

        console.log('[ConflictResolution] Sending message:', message);
        socket.send(message);
      } else {
        console.warn('[ConflictResolution] Socket not available');
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
      console.log('[ConflictResolution] Setting user ready:', userId, isReady);

      // Update local participant state
      setParticipants((prev) => {
        const updated = prev.map((p) =>
          p.id === userId ? { ...p, isReady } : p
        );
        console.log(
          '[ConflictResolution] Updated local participants:',
          updated
        );
        return updated;
      });

      // Broadcast ready status
      if (socket) {
        const message = JSON.stringify({
          type: 'user_ready',
          userId,
          isReady,
        } as ConflictResolutionMessage);
        console.log('[ConflictResolution] Broadcasting ready status:', message);
        socket.send(message);
      }
    },
    [socket, userId]
  );

  const allParticipantsReady = useCallback(() => {
    const ready =
      participants.length >= 2 && participants.every((p) => p.isReady);
    console.log('[ConflictResolution] All ready check:', {
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
