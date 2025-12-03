import { Phrase } from "@/types";
import { generatePhraseDefinition } from "./gemini";

export function createPhrase(text: string): Phrase {
  return {
    id: crypto.randomUUID(),
    text: text.trim(),
    definition: "Generating definition...",
    examples: [],
  };
}

export async function enrichPhraseWithAI(phrase: Phrase): Promise<Phrase> {
  const { definition, examples } = await generatePhraseDefinition(phrase.text);
  return {
    ...phrase,
    definition,
    examples,
  };
}
