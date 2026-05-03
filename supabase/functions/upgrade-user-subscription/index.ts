import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UpgradeRequest {
  userId: string;
  tier: 'premium' | 'free';
  expiresAt: string;
  codeId?: string;
  promoCode?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "No authorization header" }, 401);

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    const body: UpgradeRequest = await req.json();

    // Authorization: self or admin only
    if (body.userId !== user.id) {
      const { data: adminRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      if (!adminRole) return json({ error: "Cannot upgrade other users" }, 403);
    }

    let codeId = body.codeId;
    let expiresAt = body.expiresAt;

    // Atomic server-side promo validation when promoCode provided
    if (body.promoCode) {
      const normalized = body.promoCode.trim().toUpperCase();
      const { data: codeData, error: codeErr } = await supabaseAdmin
        .from('premium_codes')
        .select('*')
        .eq('code', normalized)
        .eq('is_active', true)
        .maybeSingle();

      if (codeErr || !codeData) return json({ error: "Invalid promo code" }, 400);

      if (codeData.expires_at && new Date(codeData.expires_at) < new Date())
        return json({ error: "Promo code expired" }, 400);

      if (codeData.max_uses !== null && (codeData.current_uses ?? 0) >= codeData.max_uses)
        return json({ error: "Promo code usage limit reached" }, 400);

      if (codeData.per_user_limit !== null) {
        const { count } = await supabaseAdmin
          .from('promo_code_redemptions')
          .select('*', { count: 'exact', head: true })
          .eq('code_id', codeData.id)
          .eq('user_id', body.userId);
        if (count !== null && count >= codeData.per_user_limit)
          return json({ error: "You have already redeemed this code" }, 400);
      }

      const expiry = new Date();
      if (codeData.months_granted && codeData.months_granted > 0) {
        expiry.setMonth(expiry.getMonth() + codeData.months_granted);
      } else {
        expiry.setDate(expiry.getDate() + (codeData.duration_days ?? 30));
      }
      expiresAt = expiry.toISOString();
      codeId = codeData.id;

      // Record redemption
      await supabaseAdmin.from('promo_code_redemptions').insert({
        code_id: codeData.id,
        user_id: body.userId,
      });
      await supabaseAdmin
        .from('premium_codes')
        .update({ current_uses: (codeData.current_uses ?? 0) + 1 })
        .eq('id', codeData.id);
    }

    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        subscription_tier: body.tier,
        role: body.tier,
        subscription_expires_at: expiresAt,
      })
      .eq('id', body.userId);

    if (profileError) {
      return json({ error: "Failed to update profile", details: profileError.message }, 500);
    }

    if (body.tier === 'premium') {
      await supabaseAdmin
        .from('user_roles')
        .upsert(
          { user_id: body.userId, role: 'premium', granted_at: new Date().toISOString() },
          { onConflict: 'user_id,role' }
        );
    } else {
      await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', body.userId)
        .eq('role', 'premium');
    }

    // Legacy path: increment usage when called with codeId only
    if (!body.promoCode && codeId) {
      const { data: codeData } = await supabaseAdmin
        .from('premium_codes')
        .select('current_uses')
        .eq('id', codeId)
        .maybeSingle();
      if (codeData) {
        await supabaseAdmin
          .from('premium_codes')
          .update({ current_uses: (codeData.current_uses ?? 0) + 1 })
          .eq('id', codeId);
      }
    }

    return json({ success: true, tier: body.tier, expiresAt });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Internal server error" }, 500);
  }
};

serve(handler);
