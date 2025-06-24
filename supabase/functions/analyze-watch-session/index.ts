
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { movie, session } = await req.json();

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Analyze this user session for "${movie.title}" (${movie.duration} seconds duration).

Session data:
- Total watched time: ${session.total_watched_time} seconds
- Watch events: ${JSON.stringify(session.events)}

Determine if this session qualifies as a meaningful watch that should deduct a credit.

Rules:
- Deduct if user watched at least 20 minutes (1200 seconds) OR 50% of total duration
- Consider user engagement (not just quick previews or accidental plays)
- Look for patterns indicating genuine viewing intent

Respond with exactly: YES or NO`;

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
            content: 'You are an expert at analyzing user video watching behavior to determine if they genuinely watched content or just previewed it.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 10,
        temperature: 0.1
      }),
    });

    const data = await response.json();
    const decision = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ shouldDeduct: decision }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-watch-session function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
