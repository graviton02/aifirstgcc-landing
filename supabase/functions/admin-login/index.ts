import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const adminPasswordHash = Deno.env.get("ADMIN_PASSWORD_HASH");

  if (!supabaseUrl || !supabaseServiceKey) {
    return json({ error: "Server misconfigured" }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let body: {
    action: string;
    password?: string;
    session_token?: string;
  };

  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { action } = body;

  if (!action) {
    return json({ error: "action is required" }, 400);
  }

  switch (action) {
    case "login":
      return handleLogin(supabase, body.password, adminPasswordHash);
    case "logout":
      return handleLogout(supabase, body.session_token);
    default:
      return json({ error: `Unknown action: ${action}` }, 400);
  }
});

// ---------------------------------------------------------------------------
// Login handler
// ---------------------------------------------------------------------------

async function handleLogin(
  supabase: ReturnType<typeof createClient>,
  password: string | undefined,
  adminPasswordHash: string | undefined
) {
  if (!password) {
    return json({ error: "password is required" }, 400);
  }

  if (!adminPasswordHash) {
    return json({ error: "Admin password not configured" }, 500);
  }

  // Hash the incoming password with SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  // Constant-time comparison
  if (!timingSafeEqual(hashHex, adminPasswordHash.toLowerCase())) {
    return json({ error: "Invalid password" }, 401);
  }

  // Generate session token
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Insert session
  const { error } = await supabase
    .from("admin_sessions")
    .insert({ session_token: sessionToken, expires_at: expiresAt });

  if (error) {
    return json({ error: error.message }, 500);
  }

  return json({ session_token: sessionToken, expires_at: expiresAt });
}

// ---------------------------------------------------------------------------
// Logout handler
// ---------------------------------------------------------------------------

async function handleLogout(
  supabase: ReturnType<typeof createClient>,
  sessionToken: string | undefined
) {
  if (!sessionToken) {
    return json({ error: "session_token is required" }, 400);
  }

  const { error } = await supabase
    .from("admin_sessions")
    .delete()
    .eq("session_token", sessionToken);

  if (error) {
    return json({ error: error.message }, 500);
  }

  return json({ success: true });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
