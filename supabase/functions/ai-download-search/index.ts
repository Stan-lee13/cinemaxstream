
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
    const { searchQuery, contentType } = await req.json();

    if (!searchQuery) {
      return new Response(
        JSON.stringify({ success: false, error: 'Search query is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`AI Search initiated for: ${searchQuery}`);

    // Step 1: Use OpenAI to optimize the search query
    const optimizedQuery = await optimizeSearchQuery(searchQuery, contentType);
    console.log(`Optimized query: ${optimizedQuery}`);

    // Step 2: Perform intelligent search using multiple strategies
    const searchStrategies = [
      `site:nkiri.com "${optimizedQuery}"`,
      `site:nkiri.com ${optimizedQuery}`,
      `"${optimizedQuery}" site:nkiri.com download`,
      `${optimizedQuery} nkiri.com`
    ];

    // For demo purposes, we'll simulate the search results
    // In production, you'd use a search API like Google Custom Search or Bing
    const mockResults = await simulateSearch(optimizedQuery, searchStrategies);

    if (mockResults.length > 0) {
      const bestResult = mockResults[0];
      console.log(`Found result: ${bestResult.url}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          nkiriUrl: bestResult.url,
          title: bestResult.title,
          confidence: bestResult.confidence
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'No matching content found on Nkiri'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Search error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function optimizeSearchQuery(query: string, contentType: string): Promise<string> {
  if (!openAIApiKey) {
    console.log('No OpenAI key, using original query');
    return query;
  }

  try {
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
            content: `You are a search query optimizer for finding movies and TV shows on nkiri.com. 
            Your job is to take a user's search query and optimize it for better search results.
            
            Rules:
            - Keep the core title intact
            - Add relevant keywords like "download", "watch", "free" if appropriate
            - For series, ensure season/episode info is clear
            - Remove unnecessary words
            - Return ONLY the optimized query, nothing else`
          },
          {
            role: 'user',
            content: `Optimize this search query for ${contentType}: "${query}"`
          }
        ],
        max_tokens: 100,
        temperature: 0.3
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI optimization error:', error);
    return query;
  }
}

async function simulateSearch(query: string, strategies: string[]): Promise<any[]> {
  // This is a mock implementation
  // In production, you'd integrate with Google Custom Search API or similar
  
  const mockNkiriResults = [
    {
      url: `https://nkiri.com/movies/${query.toLowerCase().replace(/\s+/g, '-')}`,
      title: query,
      confidence: 0.9
    },
    {
      url: `https://nkiri.com/series/${query.toLowerCase().replace(/\s+/g, '-')}`,
      title: query,
      confidence: 0.8
    }
  ];

  // Simulate some delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return mock results that would typically come from actual search
  return mockNkiriResults;
}
