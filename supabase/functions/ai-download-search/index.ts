
// This file runs in Deno at runtime. Add minimal hints and suppress IDE/tsserver resolver

// Deno runtime provides `serve`. Declare it for local type-checking so TS doesn't try to
// resolve remote std module imports.
declare function serve(handler: (req: Request) => Promise<Response> | Response): void;

const openAIApiKey = (() => {
  const g = globalThis as unknown;
  if (typeof g === "object" && g !== null && "Deno" in g) {
    const d = (g as { Deno?: { env?: { get(k: string): string | undefined } } }).Deno;
    return d?.env?.get("OPENAI_API_KEY");
  }
  return undefined;
})();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Security: Rate limiting (basic in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(clientId);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Input validation
function sanitizeSearchQuery(query: string): string {
  // Remove potentially dangerous characters and limit length
  return query
    .replace(/[<>'"&\\]/g, '')
    .trim()
    .substring(0, 200);
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Basic rate limiting by IP or auth header
    const clientId = req.headers.get('authorization') || req.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkRateLimit(clientId)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    const { searchQuery, contentType } = await req.json();

    if (!searchQuery || typeof searchQuery !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Search query is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const sanitizedQuery = sanitizeSearchQuery(searchQuery);
    if (sanitizedQuery.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'Search query too short' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`AI Search initiated for content type: ${contentType || 'unknown'}`);

    // Step 1: Use OpenAI to optimize the search query
    const optimizedQuery = await optimizeSearchQuery(sanitizedQuery, contentType || 'movie');
    
    // Step 2: Build Nkiri URL based on content type
    const nkiriUrl = buildNkiriUrl(optimizedQuery, contentType || 'movie');

    return new Response(
      JSON.stringify({
        success: true,
        nkiriUrl: nkiriUrl,
        title: sanitizedQuery,
        confidence: 0.8
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('AI Search error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Search processing failed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function buildNkiriUrl(query: string, contentType: string): string {
  // Build a search URL for Nkiri based on the query
  const slug = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
  
  const baseUrl = 'https://nkiri.com';
  
  switch (contentType.toLowerCase()) {
    case 'series':
    case 'tv':
      return `${baseUrl}/series/${slug}`;
    case 'anime':
      return `${baseUrl}/anime/${slug}`;
    default:
      return `${baseUrl}/movies/${slug}`;
  }
}

async function optimizeSearchQuery(query: string, contentType: string): Promise<string> {
  if (!openAIApiKey) {
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
            content: `You are a search query optimizer for finding movies and TV shows. 
            Your job is to take a user's search query and return the canonical title.
            
            Rules:
            - Return ONLY the movie/show title, nothing else
            - Fix common typos
            - Use the official title format
            - Remove unnecessary words like "download", "watch", "free"
            - For series, keep season/episode info if provided
            - Return ONLY the optimized title, no explanations`
          },
          {
            role: 'user',
            content: `Optimize this ${contentType} search query: "${query}"`
          }
        ],
        max_tokens: 100,
        temperature: 0.1
      }),
    });

    interface OpenAIResponse {
      choices?: Array<{ message?: { content?: string } }>;
    }

    const data = (await response.json()) as OpenAIResponse;
    const result = data?.choices?.[0]?.message?.content?.trim();
    
    // Validate result doesn't contain injection attempts
    if (result && result.length < 200 && !/[<>'"\\]/.test(result)) {
      return result;
    }
    
    return query;
  } catch (error) {
    console.error('OpenAI optimization error:', error);
    return query;
  }
}

export {};
