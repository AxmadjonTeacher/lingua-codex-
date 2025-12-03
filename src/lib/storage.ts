import { VideoEntry } from "@/types";

const STORAGE_KEY = "lingua-codex-phrase-box";

export function getPhraseBox(): VideoEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveToPhraseBox(entry: VideoEntry): void {
  const entries = getPhraseBox();
  const existingIndex = entries.findIndex((e) => e.id === entry.id);
  
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function removeFromPhraseBox(id: string): void {
  const entries = getPhraseBox().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getVideoEntry(id: string): VideoEntry | undefined {
  return getPhraseBox().find((e) => e.id === id);
}
