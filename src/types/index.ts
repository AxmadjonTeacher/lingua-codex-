export interface Phrase {
  id: string;
  text: string;
  definition?: string;
  examples?: string[];
  audioData?: string;
  createdAt?: number;
}

export interface Session {
  id: string;
  title: string;
  youtubeUrl: string;
  youtubeId: string;
  notes: string;
  phrases: Phrase[];
  createdAt: number;
  updatedAt: number;
}

export interface Flashcard {
  id: string;
  phrase: string;
  definition: string;
  examples: string[];
}
