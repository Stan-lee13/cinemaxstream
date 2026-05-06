// send-push: Sends a Web Push notification to one or many users via VAPID.
// Body: { user_ids?: string[], all_users?: boolean, title: string, body: string, route?: string, tag?: string }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:cinemaxstream7@gmail.com";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  } catch (e) {
    console.error("VAPID setup failed:", e instanceof Error ? e.message : e);
  }
}

interface PushBody {
  user_ids?: string[];
  all_users?: boolean;
  title: string;
  body: string;
  route?: string;
  tag?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
      return new Response(
        JSON.stringify({ error: "VAPID keys not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = (await req.json()) as PushBody;
    if (!payload?.title || !payload?.body) {
      return new Response(
        JSON.stringify({ error: "title and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let query = supabase.from("push_subscriptions").select("endpoint, p256dh, auth, user_id");
    if (payload.user_ids?.length) query = query.in("user_id", payload.user_ids);
    else if (!payload.all_users) {
      return new Response(
        JSON.stringify({ error: "user_ids or all_users required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: subs, error } = await query;
    if (error) throw error;

    const message = JSON.stringify({
      title: payload.title,
      body: payload.body,
      route: payload.route || "/",
      tag: payload.tag,
    });

    let sent = 0;
    let failed = 0;
    const stale: string[] = [];

    await Promise.all(
      (subs || []).map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            message
          );
          sent++;
        } catch (e: unknown) {
          failed++;
          const err = e as { statusCode?: number; message?: string };
          if (err.statusCode === 404 || err.statusCode === 410) stale.push(s.endpoint);
          else console.error("push error:", err.message || err);
        }
      })
    );

    if (stale.length) {
      await supabase.from("push_subscriptions").delete().in("endpoint", stale);
    }

    return new Response(
      JSON.stringify({ sent, failed, removed_stale: stale.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("send-push fatal:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
