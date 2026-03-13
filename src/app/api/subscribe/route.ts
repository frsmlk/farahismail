import { NextRequest } from 'next/server';
import { getEventsSince } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const lastEventId = parseInt(
    req.headers.get('last-event-id') ??
      req.nextUrl.searchParams.get('lastEventId') ??
      '0',
    10,
  );

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let cursor = isNaN(lastEventId) ? 0 : lastEventId;
      let alive = true;

      const send = (text: string) => {
        if (alive) controller.enqueue(encoder.encode(text));
      };

      const poll = async () => {
        try {
          const events = await getEventsSince(cursor);
          for (const evt of events) {
            send(
              `id: ${evt.id}\nevent: ${evt.type}\ndata: ${JSON.stringify(evt.payload)}\n\n`,
            );
            cursor = evt.id;
          }
        } catch {
          // DB hiccup — skip this tick
        }
      };

      // Initial poll
      await poll();

      // Poll every 2 seconds
      const interval = setInterval(poll, 2000);

      // Keep-alive every 15 seconds
      const keepAlive = setInterval(() => send(': keepalive\n\n'), 15000);

      // Clean up on disconnect
      req.signal.addEventListener('abort', () => {
        alive = false;
        clearInterval(interval);
        clearInterval(keepAlive);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
