import { supabase } from "@/integrations/supabase/client";

interface GeminiResponse {
  definition: string;
  examples: string[];
}

interface GeminiTTSResponse {
  audioData: string | null;
}

export async function generatePhraseDefinition(phrase: string): Promise<GeminiResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-phrase', {
      body: { phrase },
    });

    if (error) {
      console.error("Edge function error:", error);
      throw new Error("Failed to generate definition");
    }

    if (data.error) {
      console.error("Gemini API error:", data.error);
      throw new Error(data.error);
    }

    return {
      definition: data.definition || `Definition for "${phrase}"`,
      examples: data.examples || [],
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

export async function generateAudioPronunciation(text: string): Promise<GeminiTTSResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-audio', {
      body: { text },
    });

    if (error) {
      console.error("Edge function error:", error);
      return { audioData: null };
    }

    return { audioData: data?.audioData || null };
  } catch (error) {
    console.error("Gemini TTS error:", error);
    return { audioData: null };
  }
}
