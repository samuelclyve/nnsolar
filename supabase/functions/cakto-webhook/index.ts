import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getCaktoToken(): Promise<string> {
  const clientId = Deno.env.get("CAKTO_CLIENT_ID")!;
  const clientSecret = Deno.env.get("CAKTO_CLIENT_SECRET")!;

  const res = await fetch("https://api.cakto.com.br/public_api/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret }),
  });

  if (!res.ok) throw new Error("Failed to authenticate with Cakto");
  const data = await res.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // ACTION: webhook - receives Cakto payment notifications
    if (req.method === "POST" && (!action || action === "webhook")) {
      const payload = await req.json();
      console.log("Cakto webhook received:", JSON.stringify(payload));

      // Cakto sends order data with customer email
      const customerEmail = payload?.customer?.email || payload?.email;
      const orderStatus = payload?.status;
      const orderType = payload?.type; // "unique" or "subscription"
      const amount = parseFloat(payload?.amount || "0");

      if (!customerEmail) {
        return new Response(JSON.stringify({ error: "No customer email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find workspace by owner email
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", (
          await supabase.auth.admin.listUsers()
        ).data.users.find((u: any) => u.email === customerEmail)?.id || "");

      // Alternative: find workspace where owner email matches
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users.users.find((u: any) => u.email === customerEmail);

      if (!user) {
        console.log("User not found for email:", customerEmail);
        return new Response(JSON.stringify({ ok: true, message: "User not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find workspace
      const { data: members } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id);

      if (!members || members.length === 0) {
        return new Response(JSON.stringify({ ok: true, message: "No workspace" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const workspaceId = members[0].workspace_id;

      if (orderStatus === "paid" || orderStatus === "approved") {
        // Determine plan type based on amount
        const planType = amount >= 1500 ? "annual" : "monthly";
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + (planType === "annual" ? 12 : 1));

        // Update workspace
        await supabase
          .from("workspaces")
          .update({
            subscription_status: "active",
            plan: planType,
          })
          .eq("id", workspaceId);

        // Upsert subscription
        await supabase.from("subscriptions").upsert(
          {
            workspace_id: workspaceId,
            plan_type: planType,
            amount: amount,
            status: "active",
            current_period_start: new Date().toISOString(),
            current_period_end: periodEnd.toISOString(),
          },
          { onConflict: "workspace_id" }
        );

        console.log(`Workspace ${workspaceId} activated with ${planType} plan`);
      } else if (orderStatus === "refunded" || orderStatus === "canceled" || orderStatus === "chargedback") {
        await supabase
          .from("workspaces")
          .update({ subscription_status: "cancelled" })
          .eq("id", workspaceId);

        console.log(`Workspace ${workspaceId} cancelled`);
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: check-orders - verify payment status for a workspace
    if (action === "check-orders") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabaseUser = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: claimsData, error: claimsError } = await supabaseUser.auth.getUser();
      if (claimsError || !claimsData.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userEmail = claimsData.user.email;
      const token = await getCaktoToken();

      // Check orders for this email
      const ordersRes = await fetch(
        `https://api.cakto.com.br/public_api/orders/?customer=${encodeURIComponent(userEmail || "")}&status=paid&ordering=-paidAt&limit=5`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!ordersRes.ok) {
        return new Response(JSON.stringify({ error: "Failed to fetch orders" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const orders = await ordersRes.json();
      return new Response(JSON.stringify({ orders: orders.results || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Cakto webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
