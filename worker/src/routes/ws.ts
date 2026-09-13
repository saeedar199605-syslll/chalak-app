import { Hono } from 'hono';
import { Env } from '../types';

const ws = new Hono<{ Bindings: Env }>();

ws.get('/', async (c) => {
  if (c.req.header('Upgrade') !== 'websocket') {
    return c.text('Expected WebSocket Connection', 426);
  }

  const workspaceId = c.req.query('workspaceId') || 'default_org';
  const userId = c.req.query('userId') || 'anon';
  const name = c.req.query('name') || 'User';

  const doId = c.env.REALTIME_ROOM.idFromName(workspaceId);
  const room = c.env.REALTIME_ROOM.get(doId);

  const url = new URL(c.req.url);
  url.searchParams.set('userId', userId);
  url.searchParams.set('name', name);

  return room.fetch(url.toString(), c.req.raw);
});

export { ws };
