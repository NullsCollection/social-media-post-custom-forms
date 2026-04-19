"use client";

import { useRef, useCallback } from "react";

const MAX_RETRIES = 15;

interface PollingCallbacks {
  onComplete: () => void;
  onCaptionReady: (caption: string, executionId: string) => void;
  onError: (message: string) => void;
}

export function usePolling({ onComplete, onCaptionReady, onError }: PollingCallbacks) {
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const executionIdRef = useRef<string | null>(null);
  const retryRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (id: string) => {
      stopPolling();
      executionIdRef.current = id;
      retryRef.current = 0;

      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/caption-status?executionId=${encodeURIComponent(id)}`,
          );
          if (!res.ok) {
            retryRef.current += 1;
            console.error(`[usePolling] HTTP ${res.status} for executionId: ${id} (attempt ${retryRef.current})`);
            if (retryRef.current >= MAX_RETRIES) {
              stopPolling();
              executionIdRef.current = null;
              onError("Could not reach the server. Please refresh and try again.");
            }
            return;
          }

          retryRef.current = 0;
          const data = await res.json();

          if (data.completed) {
            stopPolling();
            executionIdRef.current = null;
            onComplete();
          } else if (!data.pending) {
            if (!data.caption) {
              console.error("[usePolling] Caption ready but missing caption field:", data);
              stopPolling();
              onError("Something went wrong while receiving the caption. Please try again.");
              return;
            }
            stopPolling();
            onCaptionReady(data.caption, data.executionId);
          }
        } catch (err) {
          retryRef.current += 1;
          console.error(`[usePolling] Network error (attempt ${retryRef.current}):`, err);
          if (retryRef.current >= MAX_RETRIES) {
            stopPolling();
            executionIdRef.current = null;
            onError("Lost connection to the server. Please refresh and try again.");
          }
        }
      }, 2000);
    },
    [stopPolling, onComplete, onCaptionReady, onError],
  );

  return { startPolling, stopPolling, executionIdRef };
}
