export interface Phrase {
  id: string;
  text: string;
  definition?: string;
  examples?: string[];
}

export interface VideoEntry {
  id: string;
  youtubeUrl: string;
  youtubeId: string;
  title: string;
  phrases: Phrase[];
  createdAt: number;
}

export interface Flashcard {
  id: string;
  phrase: string;
  definition: string;
  examples: string[];
}
