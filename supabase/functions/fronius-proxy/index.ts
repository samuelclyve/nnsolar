import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fronius Solar.web API (Cloud monitoring)
// Auth: AccessKeyId + AccessKeyValue in headers
async function froniusRequest(apiUrl: string, apiKey: string, accessKeyId: string, accessKeyValue: string, endpoint: string, params: Record<string, any> = {}) {
  const url = new URL(endpoint, apiUrl);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "AccessKeyId": accessKeyId,
    "AccessKeyValue": accessKeyValue,
  };

  const resp = await fetch(url.toString(), {
    method: "GET",
    headers,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Fronius API error [${resp.status}]: ${text}`);
  }

  return resp.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const jwtToken = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(jwtToken);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { action, workspace_id, ...params } = await req.json();

    if (!workspace_id) {
      return new Response(JSON.stringify({ error: "workspace_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: isMember } = await adminClient.rpc("is_workspace_member", {
      _user_id: userId, _workspace_id: workspace_id,
    });
    if (!isMember) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: creds } = await adminClient
      .from("fronius_credentials")
      .select("*")
      .eq("workspace_id", workspace_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!creds) {
      return new Response(
        JSON.stringify({ error: "Fronius não configurado." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { api_url, api_key, access_key_id, access_key_value } = creds;
    let result: any;

    switch (action) {
      case "systemList": {
        result = await froniusRequest(api_url, api_key, access_key_id || api_key, access_key_value || api_key, "/pvsystems");
        break;
      }

      case "systemDetail": {
        result = await froniusRequest(api_url, api_key, access_key_id || api_key, access_key_value || api_key, `/pvsystems/${params.systemId}`);
        break;
      }

      case "systemFlow": {
        result = await froniusRequest(api_url, api_key, access_key_id || api_key, access_key_value || api_key, `/pvsystems/${params.systemId}/flowdata`);
        break;
      }

      case "systemAggData": {
        result = await froniusRequest(api_url, api_key, access_key_id || api_key, access_key_value || api_key, `/pvsystems/${params.systemId}/aggdata`, {
          period: params.period || "day", // day, month, year, total
          from: params.from,
          to: params.to,
        });
        break;
      }

      case "deviceList": {
        result = await froniusRequest(api_url, api_key, access_key_id || api_key, access_key_value || api_key, `/pvsystems/${params.systemId}/devices`);
        break;
      }

      case "deviceDetail": {
        result = await froniusRequest(api_url, api_key, access_key_id || api_key, access_key_value || api_key, `/pvsystems/${params.systemId}/devices/${params.deviceId}`);
        break;
      }

      case "deviceAlarms": {
        result = await froniusRequest(api_url, api_key, access_key_id || api_key, access_key_value || api_key, `/pvsystems/${params.systemId}/devices/${params.deviceId}/alerts`);
        break;
      }

      case "syncDevices": {
        const systemsResp = await froniusRequest(api_url, api_key, access_key_id || api_key, access_key_value || api_key, "/pvsystems");
        const systems = systemsResp?.pvSystems || systemsResp?.data || [];
        const allDevices: any[] = [];

        for (const sys of (Array.isArray(systems) ? systems : [])) {
          const systemId = sys.pvSystemId || sys.id;
          const systemName = sys.name || "";
          try {
            const devResp = await froniusRequest(api_url, api_key, access_key_id || api_key, access_key_value || api_key, `/pvsystems/${systemId}/devices`);
            const devices = devResp?.devices || devResp?.data || [];
            for (const dev of (Array.isArray(devices) ? devices : [])) {
              allDevices.push({
                workspace_id,
                device_id: String(dev.deviceId || dev.id),
                device_sn: dev.serialNumber || dev.sn || String(dev.deviceId || dev.id),
                system_id: String(systemId),
                system_name: systemName,
                device_model: dev.model || dev.deviceType || null,
                device_type: (dev.deviceType || "inverter").toLowerCase(),
                is_active: true,
              });
            }
          } catch (e) {
            console.error(`Error fetching devices for system ${systemId}:`, e);
          }
        }

        if (allDevices.length > 0) {
          await adminClient.from("fronius_inverters").upsert(allDevices, {
            onConflict: "workspace_id,device_sn",
          });
        }

        result = { success: true, data: { synced: allDevices.length, devices: allDevices } };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("fronius-proxy error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
