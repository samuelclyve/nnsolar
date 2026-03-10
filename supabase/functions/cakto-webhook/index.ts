import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // ACTION: generate-checkout - create checkout URL for authenticated user
    if (action === "generate-checkout") {
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

      const { data: userData, error: userError } = await supabaseUser.auth.getUser();
      if (userError || !userData.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await req.json();
      const planId = body.plan_id; // "monthly" or "annual"

      const offerIds: Record<string, string> = {
        monthly: "gcwi2tz_800072",
        annual: "3daq6qh_800085",
      };

      const offerId = offerIds[planId];
      if (!offerId) {
        return new Response(JSON.stringify({ error: "Invalid plan" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Build checkout URL with user email for auto-fill
      const params = new URLSearchParams({ email: userData.user.email || "" });
      const checkoutUrl = `https://pay.cakto.com.br/${offerId}?${params.toString()}`;

      return new Response(JSON.stringify({ checkout_url: checkoutUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: webhook (default POST) - receives Cakto payment notifications
    if (req.method === "POST" && (!action || action === "webhook")) {
      const webhookData = await req.json();
      console.log("Cakto webhook received:", JSON.stringify(webhookData));

      // Validate webhook secret
      const webhookSecret = Deno.env.get("CAKTO_WEBHOOK_SECRET");
      if (webhookData.secret !== webhookSecret) {
        console.error("Invalid webhook secret");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const event = webhookData.event;
      const data = webhookData.data;
      const customer = data?.customer;
      const transactionId = data?.id;
      const amount = data?.amount || 0;
      const paymentMethod = data?.paymentMethod || "unknown";

      if (!customer?.email) {
        return new Response(JSON.stringify({ error: "No customer email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find user by email
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users.users.find((u: any) => u.email === customer.email);

      if (!user) {
        console.log("User not found for email:", customer.email);
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

      // Handle events
      if (event === "purchase_approved") {
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

        // Record payment history
        await supabase.from("payment_history").insert({
          user_id: user.id,
          workspace_id: workspaceId,
          cakto_transaction_id: transactionId,
          amount: amount,
          currency: "BRL",
          status: "completed",
          payment_method: paymentMethod,
          webhook_data: data,
        });

        console.log(`Workspace ${workspaceId} activated with ${planType} plan`);

      } else if (event === "refund") {
        await supabase
          .from("workspaces")
          .update({ subscription_status: "cancelled", plan: "free" })
          .eq("id", workspaceId);

        await supabase.from("payment_history").insert({
          user_id: user.id,
          workspace_id: workspaceId,
          cakto_transaction_id: `refund_${transactionId}`,
          amount: -amount,
          currency: "BRL",
          status: "refunded",
          payment_method: "refund",
          webhook_data: data,
        });

        console.log(`Workspace ${workspaceId} refunded`);

      } else if (event === "subscription_cancelled") {
        await supabase
          .from("workspaces")
          .update({ subscription_status: "cancelled", plan: "free" })
          .eq("id", workspaceId);

        await supabase.from("payment_history").insert({
          user_id: user.id,
          workspace_id: workspaceId,
          cakto_transaction_id: `cancel_${transactionId}`,
          amount: 0,
          currency: "BRL",
          status: "cancelled",
          payment_method: "cancellation",
          webhook_data: data,
        });

        console.log(`Workspace ${workspaceId} cancelled`);
      } else {
        console.log(`Unhandled event: ${event}`);
      }

      return new Response(JSON.stringify({ ok: true, event }), {
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
