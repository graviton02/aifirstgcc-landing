import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response("Server misconfigured", { status: 500 });
  }

  const { user_id, requested_role } = await req.json();

  if (!user_id || !requested_role) {
    return new Response(
      JSON.stringify({ error: "user_id and requested_role are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (requested_role !== "gcc" && requested_role !== "provider") {
    return new Response(
      JSON.stringify({ error: "requested_role must be 'gcc' or 'provider'" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check if user already has a provider profile
  const { data: providerProfile } = await supabase
    .from("provider_profiles")
    .select("id")
    .eq("user_id", user_id)
    .single();

  // Check if user has GCC activity (shortlists, problem submissions)
  const { data: gccActivity } = await supabase
    .from("agent_shortlists")
    .select("id")
    .eq("created_by_user_id", user_id)
    .limit(1);

  const hasProviderProfile = !!providerProfile;
  const hasGCCActivity = !!gccActivity?.length;

  if (requested_role === "provider" && hasGCCActivity) {
    return new Response(
      JSON.stringify({
        error: "User has GCC activity. Cannot create provider profile.",
      }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  if (requested_role === "gcc" && hasProviderProfile) {
    return new Response(
      JSON.stringify({
        error: "User has provider profile. Cannot operate as GCC.",
      }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ allowed: true }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
