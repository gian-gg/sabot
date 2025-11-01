import type * as Party from 'partykit/server';

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, _ctx: Party.ConnectionContext) {
    console.log(
      `Connected: ${conn.id}, Room: ${this.room.id}, Total connections: ${
        [...this.room.getConnections()].length
      }`
    );

    conn.send(
      JSON.stringify({
        type: 'connected',
        roomId: this.room.id,
        connectionId: conn.id,
      })
    );
  }

  onMessage(message: string, sender: Party.Connection) {
    console.log(`Message from ${sender.id}:`, message);

    // Broadcast to all connections except sender
    this.room.broadcast(message, [sender.id]);
  }

  onClose(connection: Party.Connection) {
    console.log(`Disconnected: ${connection.id}`);
  }
}

Server satisfies Party.Worker;
