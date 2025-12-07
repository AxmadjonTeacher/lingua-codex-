const GEMINI_API_KEY = "AIzaSyD5mpFFCoJ4iQ7oYakZOaRDYz_I4eGWXgM";

interface GeminiResponse {
  definition: string;
  examples: string[];
}

interface GeminiTTSResponse {
  audioData: string | null;
}

export async function generatePhraseDefinition(phrase: string): Promise<GeminiResponse> {
  const prompt = `You are a language learning assistant. For the English phrase or word "${phrase}", provide:
1. A clear, concise definition (1-2 sentences)
2. Two relevant example sentences showing how to use it in context

Respond in this exact JSON format only, no markdown:
{"definition": "your definition here", "examples": ["example 1", "example 2"]}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate definition");
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        definition: parsed.definition || `Definition for "${phrase}"`,
        examples: parsed.examples || [`Example using "${phrase}"`],
      };
    }

    throw new Error("Invalid response format");
  } catch (error) {
    console.error("Gemini API error:", error);
    // Fallback response
    return {
      definition: `The phrase "${phrase}" is commonly used in everyday conversation.`,
      examples: [
        `Here's how you might use "${phrase}" in a sentence.`,
        `Another context where "${phrase}" would be appropriate.`,
      ],
    };
  }
}

export async function generateAudioPronunciation(text: string): Promise<GeminiTTSResponse> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text }],
            },
          ],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Kore"
                }
              }
            }
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("TTS API error:", response.status);
      return { audioData: null };
    }

    const data = await response.json();
    const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    
    return { audioData };
  } catch (error) {
    console.error("Gemini TTS error:", error);
    return { audioData: null };
  }
}
