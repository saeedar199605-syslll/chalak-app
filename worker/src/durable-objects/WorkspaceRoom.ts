import { WorkspaceEvent } from '../types';

export class WorkspaceRoom implements DurableObject {
  private state: DurableObjectState;
  private sessions: Map<WebSocket, { userId: string; name: string }> = new Map();
  private lastVersion: number = 0;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.state.blockConcurrencyWhile(async () => {
      const storedVersion = await this.state.storage.get<number>('lastVersion');
      this.lastVersion = storedVersion || 0;
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // 1. WebSocket Upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      const userId = url.searchParams.get('userId') || 'anonymous';
      const name = url.searchParams.get('name') || 'کاربر سیستم';

      await this.handleWebSocketSession(server, userId, name);

      return new Response(null, {
        status: 101,
        webSocket: client
      });
    }

    // 2. HTTP Broadcast Endpoint from Worker
    if (url.pathname === '/broadcast' && request.method === 'POST') {
      try {
        const event: WorkspaceEvent = await request.json();
        this.lastVersion = Math.max(this.lastVersion, event.version);
        await this.state.storage.put('lastVersion', this.lastVersion);

        // Store event in DO ring buffer (last 50 events) for fast reconnect sync
        const events = (await this.state.storage.get<WorkspaceEvent[]>('event_buffer')) || [];
        events.push(event);
        if (events.length > 50) events.shift();
        await this.state.storage.put('event_buffer', events);

        // Broadcast to all active WebSocket clients
        const payload = JSON.stringify({ type: 'EVENT', data: event });
        for (const [ws] of this.sessions) {
          try {
            ws.send(payload);
          } catch {
            // Socket closed or dead
          }
        }

        return new Response(JSON.stringify({ success: true, clients: this.sessions.size }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // 3. Sync events since a given version
    if (url.pathname === '/sync-events' && request.method === 'GET') {
      const sinceVersion = Number(url.searchParams.get('since') || '0');
      const events = (await this.state.storage.get<WorkspaceEvent[]>('event_buffer')) || [];
      const missed = events.filter(e => e.version > sinceVersion);
      return new Response(JSON.stringify({ events: missed, currentVersion: this.lastVersion }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('WorkspaceRoom Active', { status: 200 });
  }

  private async handleWebSocketSession(ws: WebSocket, userId: string, name: string) {
    ws.accept();
    this.sessions.set(ws, { userId, name });

    // Send initial welcome & current state version
    ws.send(JSON.stringify({
      type: 'CONNECTED',
      data: {
        userId,
        currentVersion: this.lastVersion,
        activePeers: this.sessions.size
      }
    }));

    // Broadcast presence update
    this.broadcastPresence();

    ws.addEventListener('message', async (msg) => {
      try {
        const parsed = JSON.parse(msg.data as string);
        if (parsed.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        }
      } catch {
        // Ignore malformed ping
      }
    });

    ws.addEventListener('close', () => {
      this.sessions.delete(ws);
      this.broadcastPresence();
    });

    ws.addEventListener('error', () => {
      this.sessions.delete(ws);
      this.broadcastPresence();
    });
  }

  private broadcastPresence() {
    const peers = Array.from(this.sessions.values()).map(s => ({
      userId: s.userId,
      name: s.name
    }));
    const message = JSON.stringify({
      type: 'PRESENCE_UPDATE',
      data: { activeCount: this.sessions.size, peers }
    });
    for (const [ws] of this.sessions) {
      try {
        ws.send(message);
      } catch {
        // Socket closed
      }
    }
  }
}
