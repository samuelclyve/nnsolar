import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// HMAC-SHA1 signing for SolisCloud API
async function hmacSha1(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function md5Base64(data: string): Promise<string> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("MD5", enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

async function solisRequest(
  apiUrl: string,
  apiId: string,
  apiSecret: string,
  urlPath: string,
  body: string
) {
  const contentMd5 = await md5Base64(body);
  const contentType = "application/json";
  const now = new Date().toUTCString();

  const signStr = `POST\n${contentMd5}\n${contentType}\n${now}\n${urlPath}`;
  const sign = await hmacSha1(apiSecret, signStr);
  const authorization = `API ${apiId}:${sign}`;

  const resp = await fetch(`${apiUrl}${urlPath}`, {
    method: "POST",
    headers: {
      "Content-MD5": contentMd5,
      "Content-Type": contentType,
      Date: now,
      Authorization: authorization,
    },
    body,
  });

  return resp.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const { action, workspace_id, ...params } = await req.json();

    if (!workspace_id) {
      return new Response(JSON.stringify({ error: "workspace_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for credential access
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify workspace membership
    const { data: isMember } = await adminClient.rpc("is_workspace_member", {
      _user_id: userId,
      _workspace_id: workspace_id,
    });

    if (!isMember) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get credentials
    const { data: creds } = await adminClient
      .from("solis_credentials")
      .select("*")
      .eq("workspace_id", workspace_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!creds) {
      return new Response(
        JSON.stringify({ error: "SolisCloud não configurado. Configure suas credenciais na página de Integrações." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: any;

    switch (action) {
      case "stationList": {
        const body = JSON.stringify({ pageNo: 1, pageSize: 20 });
        result = await solisRequest(creds.api_url, creds.api_id, creds.api_secret, "/v1/api/userStationList", body);
        break;
      }

      case "inverterList": {
        const body = JSON.stringify({ stationId: params.stationId, pageNo: 1, pageSize: 20 });
        result = await solisRequest(creds.api_url, creds.api_id, creds.api_secret, "/v1/api/inverterList", body);
        break;
      }

      case "inverterDetail": {
        const body = JSON.stringify({ id: params.inverterId, sn: params.inverterSn });
        result = await solisRequest(creds.api_url, creds.api_id, creds.api_secret, "/v1/api/inverterDetail", body);

        // Cache the data
        if (result?.success && result?.data) {
          await adminClient.from("solis_inverters").upsert(
            {
              workspace_id,
              inverter_id: params.inverterId,
              inverter_sn: params.inverterSn,
              station_id: params.stationId || null,
              last_data: result.data,
              last_synced_at: new Date().toISOString(),
            },
            { onConflict: "workspace_id,inverter_sn" }
          );
        }
        break;
      }

      case "stationDetail": {
        const body = JSON.stringify({ id: params.stationId });
        result = await solisRequest(creds.api_url, creds.api_id, creds.api_secret, "/v1/api/stationDetail", body);
        break;
      }

      case "inverterDay": {
        const body = JSON.stringify({
          id: params.inverterId,
          sn: params.inverterSn,
          money: params.money || "BRL",
          time: params.time || new Date().toISOString().split("T")[0],
          timezone: params.timezone || -3,
        });
        result = await solisRequest(creds.api_url, creds.api_id, creds.api_secret, "/v1/api/inverterDay", body);
        break;
      }

      case "inverterMonth": {
        const body = JSON.stringify({
          id: params.inverterId,
          sn: params.inverterSn,
          money: params.money || "BRL",
          month: params.month || new Date().toISOString().slice(0, 7),
        });
        result = await solisRequest(creds.api_url, creds.api_id, creds.api_secret, "/v1/api/inverterMonth", body);
        break;
      }

      case "inverterYear": {
        const body = JSON.stringify({
          id: params.inverterId,
          sn: params.inverterSn,
          money: params.money || "BRL",
          year: params.year || new Date().getFullYear().toString(),
        });
        result = await solisRequest(creds.api_url, creds.api_id, creds.api_secret, "/v1/api/inverterYear", body);
        break;
      }

      case "control": {
        const body = JSON.stringify({
          inverterSn: params.inverterSn,
          inverterId: params.inverterId,
          cid: params.cid,
          value: params.value,
        });
        result = await solisRequest(creds.api_url, creds.api_id, creds.api_secret, "/v2/api/control", body);
        break;
      }

      case "syncInverters": {
        // Get all stations then all inverters, sync to DB
        const stationsBody = JSON.stringify({ pageNo: 1, pageSize: 20 });
        const stationsResult = await solisRequest(creds.api_url, creds.api_id, creds.api_secret, "/v1/api/userStationList", stationsBody);

        if (!stationsResult?.success || !stationsResult?.data?.page?.records) {
          result = { success: false, error: "Falha ao buscar estações" };
          break;
        }

        const allInverters: any[] = [];
        for (const station of stationsResult.data.page.records) {
          const invBody = JSON.stringify({ stationId: station.id, pageNo: 1, pageSize: 50 });
          const invResult = await solisRequest(creds.api_url, creds.api_id, creds.api_secret, "/v1/api/inverterList", invBody);
          if (invResult?.success && invResult?.data?.page?.records) {
            for (const inv of invResult.data.page.records) {
              allInverters.push({
                workspace_id,
                inverter_id: String(inv.id),
                inverter_sn: inv.sn,
                station_id: String(station.id),
                station_name: station.sno || station.stationName || null,
                inverter_model: inv.model || null,
                is_active: true,
              });
            }
          }
        }

        if (allInverters.length > 0) {
          await adminClient.from("solis_inverters").upsert(allInverters, {
            onConflict: "workspace_id,inverter_sn",
          });
        }

        result = { success: true, data: { synced: allInverters.length, inverters: allInverters } };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("solis-proxy error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
