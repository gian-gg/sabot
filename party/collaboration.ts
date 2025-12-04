import type * as Party from 'partykit/server';
import { ServerLogger } from '../src/lib/utils/logger';
import { onConnect } from 'y-partykit';

// Valid message types for server-side validation
const VALID_MESSAGE_TYPES = [
  'field_selected',
  'sync_request',
  'sync_response',
  'user_joined',
  'user_ready',
  'user_left',
  'room_full',
  'ack',
  'ping',
  'pong',
] as const;

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
  private logger = new ServerLogger('PartyKit');

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

  onConnect(conn: Party.Connection) {
    // Handle Y.js collaboration for document editing rooms
    if (this.room.id.startsWith('conflict-resolution:')) {
      this.logger.log(
        ` User connected to conflict resolution room: ${this.room.id}`
      );

      // Count unique users (not connections) in the room
      const uniqueUserIds = new Set(
        [...connectionUserMap.values()].map((info) => info.userId)
      );
      const currentUserCount = uniqueUserIds.size;

      this.logger.log(` Current unique users in room: ${currentUserCount}`);

      // Check if room is full (wait for user_joined message to identify the user)
      // We'll reject in onMessage if needed
      const existingConnectionsCount =
        [...this.room.getConnections()].length - 1; // -1 to exclude current
      this.logger.log(
        ` ${existingConnectionsCount} existing connections in room`
      );

      return;
    }

    // Default Y.js handling for document rooms
    return onConnect(conn, this.room, {
      persist: false,
      callback: {
        handler: async () => {
          this.logger.log(` User connected to room: ${this.room.id}`);
        },
      },
    });
  }

  onClose(connection: Party.Connection) {
    // Handle disconnection for conflict resolution rooms
    if (this.room.id.startsWith('conflict-resolution:')) {
      this.logger.log(
        ` User disconnected from conflict resolution room: ${this.room.id}, connection: ${connection.id}`
      );

      // Get user info from connection map
      const userInfo = connectionUserMap.get(connection.id);

      if (userInfo) {
        this.logger.log(
          ` Scheduling user_left broadcast for user: ${userInfo.userName} (${userInfo.userId})`
        );

        // Cancel any existing pending disconnect for this user
        const existingTimeout = pendingDisconnects.get(userInfo.userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          this.logger.log(
            ` Cancelled previous disconnect timer for ${userInfo.userName}`
          );
        }

        // Schedule disconnect notification after grace period
        const disconnectTimer = setTimeout(() => {
          // Check if user has reconnected with a different connection
          let userReconnected = false;
          for (const [connId, info] of connectionUserMap.entries()) {
            if (info.userId === userInfo.userId && connId !== connection.id) {
              userReconnected = true;
              this.logger.log(
                ` User ${userInfo.userName} reconnected, skipping disconnect notification`
              );
              break;
            }
          }

          if (!userReconnected) {
            this.logger.log(
              ` Broadcasting user_left for user: ${userInfo.userName} (grace period expired)`
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
        this.logger.log(` No user info found for connection ${connection.id}`);
      }
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    // Broadcast custom messages (for conflict resolution)
    if (this.room.id.startsWith('conflict-resolution:')) {
      this.logger.log(` Broadcasting message in ${this.room.id}:`, message);

      let parsed: unknown;

      try {
        parsed = JSON.parse(message);
      } catch {
        this.logger.log(` Invalid JSON, ignoring message`);
        return;
      }

      // Validate message structure
      if (!parsed || typeof parsed !== 'object') {
        this.logger.log(` Invalid message structure, ignoring`);
        return;
      }

      const msg = parsed as Record<string, unknown>;

      // Validate message type
      if (!msg.type || typeof msg.type !== 'string') {
        this.logger.log(` Message missing type field, ignoring`);
        return;
      }

      if (
        !VALID_MESSAGE_TYPES.includes(
          msg.type as (typeof VALID_MESSAGE_TYPES)[number]
        )
      ) {
        this.logger.log(` Invalid message type: ${msg.type}, ignoring`);
        return;
      }

      // Handle ping - respond with pong
      if (msg.type === 'ping') {
        sender.send(
          JSON.stringify({
            type: 'pong',
            timestamp: Date.now(),
          })
        );
        return;
      }

      // Handle pong - don't need to do anything
      if (msg.type === 'pong') {
        return;
      }

      // Handle acknowledgments - just forward to sender
      if (msg.type === 'ack') {
        // Don't broadcast acks, they're point-to-point
        return;
      }

      // Send acknowledgment back to sender for messages with messageId
      if (msg.messageId) {
        sender.send(
          JSON.stringify({
            type: 'ack',
            ackFor: msg.messageId,
          })
        );
      }

      // Handle sync_request - send current state to requester
      if (msg.type === 'sync_request') {
        this.logger.log(` Received sync_request from connection ${sender.id}`);

        // Load current state and send to requester
        this.getState().then((state) => {
          this.logger.log(
            ` Sending sync_response with ${Object.keys(state.selections).length} selections`
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
      if (msg.type === 'field_selected' && msg.selection) {
        const selection = msg.selection as SharedSelection;
        this.logger.log(` Persisting field selection: ${selection.field}`);

        // Update state in storage with conflict resolution
        this.getState().then((state) => {
          const existing = state.selections[selection.field];

          // Conflict resolution: timestamp + userId tiebreaker
          const shouldUpdate =
            !existing ||
            selection.timestamp > existing.timestamp ||
            (selection.timestamp === existing.timestamp &&
              selection.userId > existing.userId);

          if (shouldUpdate) {
            state.selections[selection.field] = selection;
            state.lastUpdated = Date.now();

            this.setState(state).then(() => {
              this.logger.log(
                ` ✅ Persisted selection for field: ${selection.field}`,
                `timestamp: ${selection.timestamp}`,
                `userId: ${selection.userId}`
              );
            });
          } else {
            this.logger.log(
              ` Ignoring lower-priority selection for field: ${selection.field}`,
              `existing timestamp: ${existing.timestamp}, userId: ${existing.userId}`,
              `incoming timestamp: ${selection.timestamp}, userId: ${selection.userId}`
            );
          }
        });
        // Continue to broadcast to other clients
      }

      // Store userId for this connection when they join
      if (msg.type === 'user_joined' && msg.userId && msg.userName) {
        this.logger.log(
          ` Storing user info for connection ${sender.id}: ${msg.userName} (${msg.userId})`
        );

        // Check if this user is already in the room (reconnection)
        const isReconnection = [...connectionUserMap.values()].some(
          (info) => info.userId === msg.userId
        );

        // Count unique users currently in room (excluding this one if new)
        const uniqueUserIds = new Set(
          [...connectionUserMap.values()].map((info) => info.userId)
        );
        const currentUserCount = uniqueUserIds.size;

        this.logger.log(
          ` Current user count: ${currentUserCount}, Is reconnection: ${isReconnection}`
        );

        // Reject if room is full and this is a new user
        if (!isReconnection && currentUserCount >= MAX_PARTICIPANTS) {
          this.logger.log(
            ` ❌ Room is full (${MAX_PARTICIPANTS} participants max). Rejecting user: ${msg.userName}`
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
        const userId = typeof msg.userId === 'string' ? msg.userId : '';
        const userName = typeof msg.userName === 'string' ? msg.userName : '';

        connectionUserMap.set(sender.id, {
          userId,
          userName,
        });

        // Cancel any pending disconnect for this user (they reconnected)
        const pendingTimeout = pendingDisconnects.get(userId);
        if (pendingTimeout) {
          clearTimeout(pendingTimeout);
          pendingDisconnects.delete(userId);
          this.logger.log(
            ` User ${userName} reconnected, cancelled disconnect timer`
          );
        }

        this.logger.log(
          ` ✅ User joined successfully, notifying ${[...this.room.getConnections()].length} connections`
        );
      }

      // Broadcast to all connections in the room (excluding sender)
      const connections = [...this.room.getConnections()];
      this.logger.log(
        ` 📡 Broadcasting ${msg.type} to ${connections.length - 1} other connections`
      );
      this.room.broadcast(message, [sender.id]);
    }
  }
}

CollaborationServer satisfies Party.Worker;
