type CaptionEntry = {
  executionId: string;
  resumeUrl: string;
  caption: string;
  fileName: string;
  expiresAt: number;
};

type CompletionEntry = {
  executionId: string;
  status: string;
  expiresAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __captionStore: Map<string, CaptionEntry> | undefined;
  // eslint-disable-next-line no-var
  var __completionStore: Map<string, CompletionEntry> | undefined;
}

const captionStore: Map<string, CaptionEntry> =
  global.__captionStore ?? (global.__captionStore = new Map());
const completionStore: Map<string, CompletionEntry> =
  global.__completionStore ?? (global.__completionStore = new Map());

const TTL = 10 * 60 * 1000;

export function storeCaptionReview(entry: Omit<CaptionEntry, "expiresAt">) {
  captionStore.set(entry.executionId, { ...entry, expiresAt: Date.now() + TTL });
}

export function storeCompletion(entry: Omit<CompletionEntry, "expiresAt">) {
  completionStore.set(entry.executionId, { ...entry, expiresAt: Date.now() + TTL });
}

export function getCaptionReview(executionId: string): Omit<CaptionEntry, "expiresAt"> | null {
  const entry = captionStore.get(executionId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    captionStore.delete(executionId);
    return null;
  }
  const { expiresAt: _, ...rest } = entry;
  return rest;
}

export function clearCaptionReview(executionId: string) {
  captionStore.delete(executionId);
}

export function getCompletion(executionId: string): Omit<CompletionEntry, "expiresAt"> | null {
  const entry = completionStore.get(executionId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    completionStore.delete(executionId);
    return null;
  }
  const { expiresAt: _, ...rest } = entry;
  return rest;
}

export function clearCompletion(executionId: string) {
  completionStore.delete(executionId);
}
