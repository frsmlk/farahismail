'use client';

import { useEffect, useRef, useCallback } from 'react';

export function useSSE(onEvent: (type: string, payload: unknown) => void) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    const es = new EventSource('/api/subscribe');

    const handler = (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        onEventRef.current(e.type, payload);
      } catch {
        onEventRef.current(e.type, {});
      }
    };

    // Listen for all known event types
    const eventTypes = [
      'entry.created',
      'entry.updated',
      'entry.deleted',
      'update.created',
      'update.updated',
      'update.deleted',
      'media.created',
      'media.updated',
      'media.deleted',
      'media.reordered',
      'profile.created',
      'profile.updated',
    ];

    for (const type of eventTypes) {
      es.addEventListener(type, handler);
    }

    es.onerror = () => {
      es.close();
      // Reconnect after 3 seconds
      setTimeout(connect, 3000);
    };

    return es;
  }, []);

  useEffect(() => {
    const es = connect();
    return () => es.close();
  }, [connect]);
}
