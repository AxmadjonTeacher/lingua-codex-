import { Phrase } from "@/types";

// Mock definitions and examples - in a real app, this would use an AI API
const mockDefinitions: Record<string, { definition: string; examples: string[] }> = {
  "no wonder": {
    definition: "Used to show that something is understandable or expected given the circumstances.",
    examples: [
      "She's been working 12 hours a day without a break—no wonder she's so tired.",
      "He forgot to set his alarm—no wonder he was late to school.",
    ],
  },
  "not that I am aware of": {
    definition: "A polite way of saying you don't know about something, while acknowledging there may be information you're not privy to.",
    examples: [
      "Has anyone called about the job? Not that I am aware of.",
      "Are there any changes to the schedule? Not that I am aware of, but let me check.",
    ],
  },
};

export function generatePhraseData(text: string): { definition: string; examples: string[] } {
  const lowerText = text.toLowerCase().trim();
  
  if (mockDefinitions[lowerText]) {
    return mockDefinitions[lowerText];
  }

  // Generate mock data for unknown phrases
  return {
    definition: `The phrase "${text}" is commonly used in everyday conversation to express a particular meaning or sentiment.`,
    examples: [
      `Example 1: Here's how you might use "${text}" in a sentence.`,
      `Example 2: Another context where "${text}" would be appropriate.`,
    ],
  };
}

export function createPhrase(text: string): Phrase {
  const { definition, examples } = generatePhraseData(text);
  
  return {
    id: crypto.randomUUID(),
    text: text.trim(),
    definition,
    examples,
  };
}
