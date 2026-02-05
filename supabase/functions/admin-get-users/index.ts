import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization")!;

    // Create client with user's auth token to verify admin status
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the requesting user is an admin
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin (either by role or by email)
    const ADMIN_EMAIL = "stanleyvic13@gmail.com";
    const { data: roleData } = await supabaseUser
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!roleData || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all users from auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });

    if (authError) {
      throw authError;
    }

    // Fetch all profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("*");

    if (profileError) {
      throw profileError;
    }

    // Fetch all roles
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("*");

    if (rolesError) {
      throw rolesError;
    }

    // Fetch blocked users
    const { data: blockedUsers, error: blockedError } = await supabaseAdmin
      .from("blocked_users")
      .select("user_id");

    if (blockedError) {
      console.error("Error fetching blocked users:", blockedError);
    }

    const blockedUserIds = new Set((blockedUsers || []).map((b) => b.user_id));

    // Merge auth users with profiles and roles
    const mergedUsers = authUsers.users.map((authUser) => {
      const profile = profiles?.find((p) => p.id === authUser.id);
      const userRole = roles?.find((r) => r.user_id === authUser.id);
      const isBlocked = blockedUserIds.has(authUser.id);

      // Email confirmation status
      const emailConfirmed = !!authUser.email_confirmed_at;

      return {
        id: authUser.id,
        email: authUser.email,
        username: profile?.username || authUser.email?.split("@")[0] || "Unknown",
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        role: userRole?.role || profile?.role || "free",
        subscription_tier: profile?.subscription_tier || "free",
        subscription_expires_at: profile?.subscription_expires_at,
        avatar_url: profile?.avatar_url,
        is_blocked: isBlocked,
        email_confirmed: emailConfirmed,
        email_confirmed_at: authUser.email_confirmed_at,
      };
    });

    return new Response(JSON.stringify({ users: mergedUsers }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in admin-get-users:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
