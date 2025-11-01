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

export default class CollaborationServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, _ctx: Party.ConnectionContext) {
    // Handle Y.js collaboration for document editing rooms
    if (this.room.id.startsWith('conflict-resolution:')) {
      console.log(
        `[PartyKit] User connected to conflict resolution room: ${this.room.id}`
      );

      // Notify this connection about existing connections
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

        // Store userId for this connection when they join
        if (parsed.type === 'user_joined' && parsed.userId && parsed.userName) {
          console.log(
            `[PartyKit] Storing user info for connection ${sender.id}: ${parsed.userName} (${parsed.userId})`
          );
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
            `[PartyKit] User joined, notifying ${[...this.room.getConnections()].length} connections`
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
