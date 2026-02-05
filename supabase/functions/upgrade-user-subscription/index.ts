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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the request is from an authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create regular client to verify the user
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: UpgradeRequest = await req.json();

    // Security: User can only upgrade themselves, or be an admin
    if (body.userId !== user.id) {
      // Check if requester is admin
      const { data: adminRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      const isRootAdmin = user.email?.toLowerCase() === 'stanleyvic13@gmail.com';

      if (!adminRole && !isRootAdmin) {
        return new Response(
          JSON.stringify({ error: "Cannot upgrade other users" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`Upgrading user ${body.userId} to ${body.tier} until ${body.expiresAt}`);

    // Update user_profiles with admin privileges
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        subscription_tier: body.tier,
        role: body.tier,
        subscription_expires_at: body.expiresAt
      })
      .eq('id', body.userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      return new Response(
        JSON.stringify({ error: "Failed to update profile", details: profileError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upsert user_roles
    if (body.tier === 'premium') {
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .upsert({ 
          user_id: body.userId, 
          role: 'premium',
          granted_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id,role' 
        });

      if (roleError) {
        console.error('Role upsert error:', roleError);
        // Continue anyway - profile is source of truth
      }
    } else {
      // Downgrade - remove premium role
      await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', body.userId)
        .eq('role', 'premium');
    }

    // Update promo code usage if provided
    if (body.codeId) {
      const { data: codeData } = await supabaseAdmin
        .from('premium_codes')
        .select('current_uses')
        .eq('id', body.codeId)
        .single();

      if (codeData) {
        await supabaseAdmin
          .from('premium_codes')
          .update({ current_uses: (codeData.current_uses ?? 0) + 1 })
          .eq('id', body.codeId);
      }
    }

    console.log(`Successfully upgraded user ${body.userId}`);

    return new Response(
      JSON.stringify({ success: true, tier: body.tier, expiresAt: body.expiresAt }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Upgrade error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
