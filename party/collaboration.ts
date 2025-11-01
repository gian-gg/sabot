import type * as Party from 'partykit/server';
import { onConnect } from 'y-partykit';

export default class CollaborationServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    return onConnect(conn, this.room, {
      persist: false,
      callback: {
        handler: async () => {
          console.log(`[PartyKit] User connected to room: ${this.room.id}`);
        },
      },
    });
  }
}

CollaborationServer satisfies Party.Worker;
