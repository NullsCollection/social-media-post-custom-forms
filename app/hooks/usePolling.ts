"use client";

import { useRef, useCallback } from "react";

interface PollingCallbacks {
  onComplete: () => void;
  onCaptionReady: (caption: string, executionId: string) => void;
  onError: (message: string) => void;
}

export function usePolling({ onComplete, onCaptionReady, onError }: PollingCallbacks) {
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const executionIdRef = useRef<string | null>(null);

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
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/caption-status?executionId=${encodeURIComponent(id)}`,
          );
          if (!res.ok) {
            console.error(`[usePolling] Status check failed — HTTP ${res.status} for executionId: ${id}`);
            return;
          }
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
          console.error("[usePolling] Network error while checking status:", err);
        }
      }, 2000);
    },
    [stopPolling, onComplete, onCaptionReady, onError],
  );

  return { startPolling, stopPolling, executionIdRef };
}
