import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const TMDB_KEY = Deno.env.get("TMDB_API_KEY") || "4626200399b08f9d04b72348e3625f15";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserWatchData {
  title: string;
  genre?: string;
  completion_percent: number;
  watch_duration: number;
  favorited: boolean;
}

interface AIRecommendationLite {
  title: string;
  reason: string;
  genre: string;
  confidence: number;
}

interface AIRecommendation extends AIRecommendationLite {
  tmdb_id?: number;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  vote_average?: number;
  content_type?: "movie" | "series";
  year?: string;
}

const lookupTmdb = async (title: string): Promise<Partial<AIRecommendation> | null> => {
  try {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&language=en-US&query=${encodeURIComponent(
      title
    )}&include_adult=false`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const json = await r.json();
    const hit = (json.results || []).find(
      (x: { media_type?: string }) => x.media_type === "movie" || x.media_type === "tv"
    );
    if (!hit) return null;
    const isMovie = hit.media_type === "movie";
    const date = (isMovie ? hit.release_date : hit.first_air_date) || "";
    return {
      tmdb_id: hit.id,
      poster_path: hit.poster_path,
      backdrop_path: hit.backdrop_path,
      overview: hit.overview,
      vote_average: hit.vote_average,
      content_type: isMovie ? "movie" : "series",
      year: date ? date.slice(0, 4) : undefined,
    };
  } catch {
    return null;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { watchData }: { watchData: UserWatchData[] } = await req.json();

    if (!watchData || watchData.length === 0) {
      return new Response(JSON.stringify({ recommendations: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const watchSummary = watchData
      .filter((item) => item.completion_percent > 10)
      .map((item) => {
        const status = item.favorited
          ? "LOVED"
          : item.completion_percent > 80
          ? "COMPLETED"
          : "PARTIAL";
        return `- ${item.title} (${Math.round(item.completion_percent)}% watched) - ${status}`;
      })
      .join("\n");

    const prompt = `Recommend 6 movies or TV shows the user will love.

WATCH HISTORY:
${watchSummary}

Respond JSON ONLY:
{"recommendations":[{"title":"...","reason":"...","genre":"...","confidence":0.85}]}
Provide exactly 6 entries with confidence between 0.5-1.0.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openAIApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a movie/TV recommendation expert. Respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) throw new Error("Invalid OpenAI response");

    let parsed: { recommendations: AIRecommendationLite[] };
    try {
      parsed = JSON.parse(data.choices[0].message.content.trim());
    } catch {
      parsed = { recommendations: [] };
    }

    // Enrich each title with TMDB data; drop unresolved entries
    const enriched: AIRecommendation[] = [];
    for (const rec of parsed.recommendations || []) {
      const tmdb = await lookupTmdb(rec.title);
      if (!tmdb?.tmdb_id) continue;
      enriched.push({ ...rec, ...tmdb });
    }

    return new Response(JSON.stringify({ recommendations: enriched }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-ai-recommendations:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage, recommendations: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
