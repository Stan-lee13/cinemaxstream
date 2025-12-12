
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserWatchData {
  title: string;
  genre?: string;
  completion_percent: number;
  watch_duration: number;
  favorited: boolean;
}

interface AIRecommendation {
  title: string;
  reason: string;
  genre: string;
  confidence: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { watchData }: { watchData: UserWatchData[] } = await req.json();

    if (!watchData || watchData.length === 0) {
      return new Response(
        JSON.stringify({ recommendations: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a detailed prompt based on user's watch history
    const watchSummary = watchData
      .filter(item => item.completion_percent > 10) // Only consider items they actually watched
      .map(item => {
        const status = item.favorited ? 'LOVED' : 
                     item.completion_percent > 80 ? 'COMPLETED' : 'PARTIAL';
        return `- ${item.title} (${Math.round(item.completion_percent)}% watched) - ${status}`;
      })
      .join('\n');

    const prompt = `
Based on this user's streaming history, recommend 5 movies or TV shows they would enjoy:

WATCH HISTORY:
${watchSummary}

ANALYSIS REQUIREMENTS:
- Look for patterns in genres, themes, and completion rates
- Consider what they loved vs what they abandoned
- Suggest diverse but relevant content
- Include both popular and hidden gems

RESPONSE FORMAT (JSON only):
{
  "recommendations": [
    {
      "title": "Movie/Show Name",
      "reason": "Brief explanation why they'd like it",
      "genre": "Primary genre",
      "confidence": 0.85
    }
  ]
}

Provide exactly 5 recommendations with confidence scores between 0.5-1.0.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a movie/TV recommendation expert. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid OpenAI response');
    }

    // Parse the JSON response
    let recommendationsData;
    try {
      const content = data.choices[0].message.content.trim();
      recommendationsData = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError);
      // Fallback recommendations
      recommendationsData = {
        recommendations: [
          {
            title: "Popular Movies",
            reason: "Based on trending content",
            genre: "Mixed",
            confidence: 0.6
          }
        ]
      };
    }

    return new Response(
      JSON.stringify(recommendationsData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-ai-recommendations function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        recommendations: [] 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
