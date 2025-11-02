import type * as Party from 'partykit/server';
import { onConnect } from 'y-partykit';

// Store userId for each connection
const connectionUserMap = new Map<
  string,
  { userId: string; userName: string }
>();

// Store pending disconnects with timers to handle reconnections
const pendingDisconnects = new Map<string, NodeJS.Timeout>();

// Grace period for reconnections (milliseconds)
const RECONNECT_GRACE_PERIOD = 8000; // 8 seconds

// Maximum participants allowed in a conflict resolution room
const MAX_PARTICIPANTS = 2;

// Types for state persistence
interface SharedSelection {
  field: string;
  value: unknown;
  userId: string;
  userName: string;
  timestamp: number;
}

interface RoomState {
  selections: Record<string, SharedSelection>;
  lastUpdated: number;
}

export default class CollaborationServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  // Load room state from storage
  async getState(): Promise<RoomState> {
    const stored = await this.room.storage.get<RoomState>('state');
    return (
      stored || {
        selections: {},
        lastUpdated: Date.now(),
      }
    );
  }

  // Save room state to storage
  async setState(state: RoomState): Promise<void> {
    await this.room.storage.put('state', state);
  }

  onConnect(conn: Party.Connection, _ctx: Party.ConnectionContext) {
    // Handle Y.js collaboration for document editing rooms
    if (this.room.id.startsWith('conflict-resolution:')) {
      console.log(
        `[PartyKit] User connected to conflict resolution room: ${this.room.id}`
      );

      // Count unique users (not connections) in the room
      const uniqueUserIds = new Set(
        [...connectionUserMap.values()].map((info) => info.userId)
      );
      const currentUserCount = uniqueUserIds.size;

      console.log(
        `[PartyKit] Current unique users in room: ${currentUserCount}`
      );

      // Check if room is full (wait for user_joined message to identify the user)
      // We'll reject in onMessage if needed
      const existingConnectionsCount =
        [...this.room.getConnections()].length - 1; // -1 to exclude current
      console.log(
        `[PartyKit] ${existingConnectionsCount} existing connections in room`
      );

      return;
    }

    // Default Y.js handling for document rooms
    return onConnect(conn, this.room, {
      persist: false,
      callback: {
        handler: async () => {
          console.log(`[PartyKit] User connected to room: ${this.room.id}`);
        },
      },
    });
  }

  onClose(connection: Party.Connection) {
    // Handle disconnection for conflict resolution rooms
    if (this.room.id.startsWith('conflict-resolution:')) {
      console.log(
        `[PartyKit] User disconnected from conflict resolution room: ${this.room.id}, connection: ${connection.id}`
      );

      // Get user info from connection map
      const userInfo = connectionUserMap.get(connection.id);

      if (userInfo) {
        console.log(
          `[PartyKit] Scheduling user_left broadcast for user: ${userInfo.userName} (${userInfo.userId})`
        );

        // Cancel any existing pending disconnect for this user
        const existingTimeout = pendingDisconnects.get(userInfo.userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          console.log(
            `[PartyKit] Cancelled previous disconnect timer for ${userInfo.userName}`
          );
        }

        // Schedule disconnect notification after grace period
        const disconnectTimer = setTimeout(() => {
          // Check if user has reconnected with a different connection
          let userReconnected = false;
          for (const [connId, info] of connectionUserMap.entries()) {
            if (info.userId === userInfo.userId && connId !== connection.id) {
              userReconnected = true;
              console.log(
                `[PartyKit] User ${userInfo.userName} reconnected, skipping disconnect notification`
              );
              break;
            }
          }

          if (!userReconnected) {
            console.log(
              `[PartyKit] Broadcasting user_left for user: ${userInfo.userName} (grace period expired)`
            );
            // Broadcast to remaining participants that this user left
            this.room.broadcast(
              JSON.stringify({
                type: 'user_left',
                userId: userInfo.userId,
                userName: userInfo.userName,
              })
            );
          }

          // Clean up
          pendingDisconnects.delete(userInfo.userId);
        }, RECONNECT_GRACE_PERIOD);

        pendingDisconnects.set(userInfo.userId, disconnectTimer);

        // Clean up connection map
        connectionUserMap.delete(connection.id);
      } else {
        console.log(
          `[PartyKit] No user info found for connection ${connection.id}`
        );
      }
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    // Broadcast custom messages (for conflict resolution)
    if (this.room.id.startsWith('conflict-resolution:')) {
      console.log(
        `[PartyKit] Broadcasting message in ${this.room.id}:`,
        message
      );

      try {
        const parsed = JSON.parse(message);

        // Handle sync_request - send current state to requester
        if (parsed.type === 'sync_request') {
          console.log(
            `[PartyKit] Received sync_request from connection ${sender.id}`
          );

          // Load current state and send to requester
          this.getState().then((state) => {
            console.log(
              `[PartyKit] Sending sync_response with ${Object.keys(state.selections).length} selections`
            );

            sender.send(
              JSON.stringify({
                type: 'sync_response',
                selections: state.selections,
              })
            );
          });

          return; // Don't broadcast sync_request
        }

        // Handle field_selected - persist to storage
        if (parsed.type === 'field_selected' && parsed.selection) {
          console.log(
            `[PartyKit] Persisting field selection: ${parsed.selection.field}`
          );

          // Update state in storage with conflict resolution
          this.getState().then((state) => {
            const existing = state.selections[parsed.selection.field];

            // Conflict resolution: timestamp + userId tiebreaker
            const shouldUpdate =
              !existing ||
              parsed.selection.timestamp > existing.timestamp ||
              (parsed.selection.timestamp === existing.timestamp &&
                parsed.selection.userId > existing.userId);

            if (shouldUpdate) {
              state.selections[parsed.selection.field] = parsed.selection;
              state.lastUpdated = Date.now();

              this.setState(state).then(() => {
                console.log(
                  `[PartyKit] ✅ Persisted selection for field: ${parsed.selection.field}`,
                  `timestamp: ${parsed.selection.timestamp}`,
                  `userId: ${parsed.selection.userId}`
                );
              });
            } else {
              console.log(
                `[PartyKit] Ignoring lower-priority selection for field: ${parsed.selection.field}`,
                `existing timestamp: ${existing.timestamp}, userId: ${existing.userId}`,
                `incoming timestamp: ${parsed.selection.timestamp}, userId: ${parsed.selection.userId}`
              );
            }
          });
        }

        // Store userId for this connection when they join
        if (parsed.type === 'user_joined' && parsed.userId && parsed.userName) {
          console.log(
            `[PartyKit] Storing user info for connection ${sender.id}: ${parsed.userName} (${parsed.userId})`
          );

          // Check if this user is already in the room (reconnection)
          const isReconnection = [...connectionUserMap.values()].some(
            (info) => info.userId === parsed.userId
          );

          // Count unique users currently in room (excluding this one if new)
          const uniqueUserIds = new Set(
            [...connectionUserMap.values()].map((info) => info.userId)
          );
          const currentUserCount = uniqueUserIds.size;

          console.log(
            `[PartyKit] Current user count: ${currentUserCount}, Is reconnection: ${isReconnection}`
          );

          // Reject if room is full and this is a new user
          if (!isReconnection && currentUserCount >= MAX_PARTICIPANTS) {
            console.log(
              `[PartyKit] ❌ Room is full (${MAX_PARTICIPANTS} participants max). Rejecting user: ${parsed.userName}`
            );

            // Send rejection message to the connecting user
            sender.send(
              JSON.stringify({
                type: 'room_full',
                message: `This transaction room is full. Only ${MAX_PARTICIPANTS} participants allowed.`,
                maxParticipants: MAX_PARTICIPANTS,
              })
            );

            // Close the connection
            sender.close(1008, 'Room is full');
            return;
          }

          // Allow connection - store user info
          connectionUserMap.set(sender.id, {
            userId: parsed.userId,
            userName: parsed.userName,
          });

          // Cancel any pending disconnect for this user (they reconnected)
          const pendingTimeout = pendingDisconnects.get(parsed.userId);
          if (pendingTimeout) {
            clearTimeout(pendingTimeout);
            pendingDisconnects.delete(parsed.userId);
            console.log(
              `[PartyKit] User ${parsed.userName} reconnected, cancelled disconnect timer`
            );
          }

          console.log(
            `[PartyKit] ✅ User joined successfully, notifying ${[...this.room.getConnections()].length} connections`
          );
        }
      } catch (_e) {
        // Ignore parse errors
      }

      // Broadcast to all connections in the room (excluding sender)
      this.room.broadcast(message, [sender.id]);
    }
  }
}

CollaborationServer satisfies Party.Worker;
