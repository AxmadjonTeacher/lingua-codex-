import { Phrase } from "@/types";
import { generatePhraseDefinition, generateAudioPronunciation } from "./gemini";

export function createPhrase(text: string): Phrase {
  return {
    id: crypto.randomUUID(),
    text: text.trim(),
    definition: "Generating definition...",
    examples: [],
    createdAt: Date.now(),
  };
}

export async function enrichPhraseWithAI(phrase: Phrase): Promise<Phrase> {
  try {
    // Run definition and audio generation in parallel
    const [definitionResult, audioResult] = await Promise.all([
      generatePhraseDefinition(phrase.text),
      generateAudioPronunciation(phrase.text),
    ]);

    return {
      ...phrase,
      definition: definitionResult.definition,
      examples: definitionResult.examples,
      audioData: audioResult.audioData || undefined,
    };
  } catch (error) {
    console.error("Error enriching phrase:", error);
    // Return phrase with error state but still try to get audio
    const audioResult = await generateAudioPronunciation(phrase.text).catch(() => ({ audioData: null }));
    return {
      ...phrase,
      definition: `Unable to generate definition for "${phrase.text}". Please try again.`,
      examples: [],
      audioData: audioResult.audioData || undefined,
    };
  }
}
