type CaptionEntry = {
  executionId: string;
  resumeUrl: string;
  caption: string;
  fileName: string;
};

type CompletionEntry = {
  executionId: string;
  status: string;
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

export function storeCaptionReview(entry: CaptionEntry) {
  captionStore.set(entry.executionId, entry);
  setTimeout(() => captionStore.delete(entry.executionId), TTL);
}

export function storeCompletion(entry: CompletionEntry) {
  completionStore.set(entry.executionId, entry);
  setTimeout(() => completionStore.delete(entry.executionId), TTL);
}

export function getCaptionReview(executionId: string): CaptionEntry | null {
  return captionStore.get(executionId) ?? null;
}

export function clearCaptionReview(executionId: string) {
  captionStore.delete(executionId);
}

export function getCompletion(executionId: string): CompletionEntry | null {
  return completionStore.get(executionId) ?? null;
}
