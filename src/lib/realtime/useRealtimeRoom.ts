import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'syncing';

export interface WorkspaceLiveEvent {
  eventId: string;
  type: string;
  entity: string;
  entityId: string;
  version: number;
  operation: 'created' | 'updated' | 'deleted';
  changedBy: { userId: string; name: string };
  payload: any;
  createdAt: string;
}

export function useRealtimeRoom(workspaceId: string = 'default_org') {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastEvent, setLastEvent] = useState<WorkspaceLiveEvent | null>(null);
  const [activePeers, setActivePeers] = useState<number>(1);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const currentVersionRef = useRef<number>(0);
  const processedEventIds = useRef<Set<string>>(new Set());

  const connect = useCallback(() => {
    if (!user) return;
    setStatus('connecting');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/ws?workspaceId=${workspaceId}&userId=${user.id}&name=${encodeURIComponent(user.name)}`;

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setStatus('connected');
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'CONNECTED') {
            currentVersionRef.current = msg.data.currentVersion || 0;
            setActivePeers(msg.data.activePeers || 1);
          }

          if (msg.type === 'PRESENCE_UPDATE') {
            setActivePeers(msg.data.activeCount || 1);
          }

          if (msg.type === 'EVENT') {
            const ev: WorkspaceLiveEvent = msg.data;

            // Idempotency check: prevent duplicate event processing
            if (processedEventIds.current.has(ev.eventId)) return;
            processedEventIds.current.add(ev.eventId);
            if (processedEventIds.current.size > 200) {
              processedEventIds.current.clear();
            }

            currentVersionRef.current = Math.max(currentVersionRef.current, ev.version);
            setLastEvent(ev);

            // Invalidate corresponding TanStack Query keys to trigger real-time UI re-render
            if (ev.entity === 'evaluation') {
              queryClient.invalidateQueries({ queryKey: ['evaluations'] });
              queryClient.invalidateQueries({ queryKey: ['evaluation', ev.entityId] });
              queryClient.invalidateQueries({ queryKey: ['reports'] });
            } else if (ev.entity === 'employee') {
              queryClient.invalidateQueries({ queryKey: ['employees'] });
            } else if (ev.entity === 'criterion') {
              queryClient.invalidateQueries({ queryKey: ['criteria'] });
            } else if (ev.entity === 'job_profile') {
              queryClient.invalidateQueries({ queryKey: ['jobProfiles'] });
            }
          }
        } catch (e) {
          console.error('WS message parse error:', e);
        }
      };

      socket.onclose = () => {
        setStatus('disconnected');
        // Exponential reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      socket.onerror = () => {
        socket.close();
      };
    } catch {
      setStatus('disconnected');
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    }
  }, [user, workspaceId, queryClient]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return {
    status,
    lastEvent,
    activePeers,
    currentVersion: currentVersionRef.current
  };
}
