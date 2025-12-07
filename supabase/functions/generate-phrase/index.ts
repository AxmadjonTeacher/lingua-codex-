import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phrase } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!phrase) {
      throw new Error('Phrase is required');
    }

    console.log(`Generating definition for phrase: "${phrase}"`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a language learning assistant. Respond only in valid JSON format without any markdown.'
          },
          {
            role: 'user',
            content: `For the English phrase or word "${phrase}", provide:
1. A clear, concise definition (1-2 sentences)
2. Two relevant example sentences showing how to use it in context

Respond in this exact JSON format only:
{"definition": "your definition here", "examples": ["example 1", "example 2"]}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error response:", errorText);
      throw new Error("Failed to generate definition");
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    
    console.log("Lovable AI response text:", text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify({
        definition: parsed.definition || `Definition for "${phrase}"`,
        examples: parsed.examples || [`Example using "${phrase}"`],
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error("Invalid response format from AI");
  } catch (error) {
    console.error('Error in generate-phrase function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      definition: null,
      examples: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
