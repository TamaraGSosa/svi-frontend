import { useCallback, useEffect, useRef, useState } from "react";
import { WS_URL } from "@/config/env";
import { tokenStorage } from "@/services/tokenStorage";
import type { AlertSummary, CameraStatus, SocketEvent, WsConnectionState } from "@/types";

export type RealtimeListener = (event: SocketEvent) => void;

function normalizeSocketMessage(raw: unknown): SocketEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const eventType = (obj.event ?? obj.type) as string | undefined;
  const payload = (obj.data ?? obj.payload) as Record<string, unknown> | undefined;
  if (!eventType || !payload) return null;

  if (eventType === "alert.created" || eventType === "alert.updated") {
    return {
      event: eventType,
      data: payload as unknown as AlertSummary,
    };
  }

  if (eventType === "camera.status") {
    const id = String(payload.id ?? payload.cameraId ?? "");
    const status = (payload.status as CameraStatus) ?? "offline";
    if (!id) return null;
    return {
      event: "camera.status",
      data: {
        id,
        status,
        latencyMs: typeof payload.latencyMs === "number" ? payload.latencyMs : undefined,
      },
    };
  }

  return null;
}

export function useRealtimeSocket(enabled: boolean) {
  const [wsState, setWsState] = useState<WsConnectionState>("disconnected");
  const listenersRef = useRef<Set<RealtimeListener>>(new Set());
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const pingTimerRef = useRef<number | null>(null);
  const attemptsRef = useRef(0);
  const manualCloseRef = useRef(false);

  const subscribe = useCallback((listener: RealtimeListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      manualCloseRef.current = true;
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      if (pingTimerRef.current) window.clearInterval(pingTimerRef.current);
      socketRef.current?.close();
      socketRef.current = null;
      setWsState("disconnected");
      return;
    }

    manualCloseRef.current = false;

    const connect = () => {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        setWsState("disconnected");
        return;
      }

      setWsState(attemptsRef.current > 0 ? "reconnecting" : "connecting");
      const url = `${WS_URL}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        attemptsRef.current = 0;
        setWsState("connected");
        if (pingTimerRef.current) window.clearInterval(pingTimerRef.current);
        pingTimerRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send("ping");
          }
        }, 25_000);
      };

      ws.onmessage = (msg) => {
        if (msg.data === "pong") return;
        try {
          const parsed = normalizeSocketMessage(JSON.parse(msg.data));
          if (parsed) {
            listenersRef.current.forEach((listener) => listener(parsed));
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onclose = () => {
        if (pingTimerRef.current) {
          window.clearInterval(pingTimerRef.current);
          pingTimerRef.current = null;
        }
        if (manualCloseRef.current) {
          setWsState("disconnected");
          return;
        }
        attemptsRef.current += 1;
        const delay = Math.min(30_000, 1000 * Math.pow(2, Math.min(attemptsRef.current, 5)));
        setWsState("reconnecting");
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      manualCloseRef.current = true;
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      if (pingTimerRef.current) window.clearInterval(pingTimerRef.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [enabled]);

  return { wsState, subscribe };
}
