import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Growatt OpenAPI V1 - Token-based authentication
async function growattRequest(apiUrl: string, token: string, endpoint: string, params: Record<string, any> = {}) {
  const url = new URL(endpoint, apiUrl);
  // Append params as query string for GET requests
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });

  const resp = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "token": token,
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Growatt API error [${resp.status}]: ${text}`);
  }

  return resp.json();
}

// POST request for Growatt API
async function growattPost(apiUrl: string, token: string, endpoint: string, body: Record<string, any> = {}) {
  const url = new URL(endpoint, apiUrl);

  const resp = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "token": token,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Growatt API error [${resp.status}]: ${text}`);
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
      .from("growatt_credentials")
      .select("*")
      .eq("workspace_id", workspace_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!creds) {
      return new Response(
        JSON.stringify({ error: "Growatt não configurado. Configure suas credenciais na página de Integrações." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: any;
    const apiUrl = creds.api_url;
    const apiToken = creds.api_token;

    switch (action) {
      case "plantList": {
        result = await growattRequest(apiUrl, apiToken, "/v1/plant/list");
        break;
      }

      case "plantDetail": {
        result = await growattRequest(apiUrl, apiToken, `/v1/plant/${params.plantId}`);
        break;
      }

      case "plantEnergy": {
        result = await growattRequest(apiUrl, apiToken, `/v1/plant/${params.plantId}/energy`, {
          date: params.date || new Date().toISOString().split("T")[0],
          type: params.type || "day", // day, month, year
        });
        break;
      }

      case "deviceList": {
        result = await growattRequest(apiUrl, apiToken, `/v1/device/list`, {
          plant_id: params.plantId,
        });
        break;
      }

      case "deviceDetail": {
        result = await growattRequest(apiUrl, apiToken, `/v1/device/${params.deviceSn}`, {
          plant_id: params.plantId,
        });
        break;
      }

      case "deviceEnergy": {
        result = await growattRequest(apiUrl, apiToken, `/v1/device/${params.deviceSn}/energy`, {
          date: params.date || new Date().toISOString().split("T")[0],
          type: params.type || "day",
          plant_id: params.plantId,
        });
        break;
      }

      case "deviceAlarms": {
        result = await growattRequest(apiUrl, apiToken, `/v1/device/${params.deviceSn}/alarm`, {
          plant_id: params.plantId,
          date: params.date || new Date().toISOString().split("T")[0],
        });
        break;
      }

      case "syncDevices": {
        // Get all plants then all devices
        const plantsResult = await growattRequest(apiUrl, apiToken, "/v1/plant/list");

        const plants = plantsResult?.data || plantsResult?.plants || plantsResult?.result?.plants || [];
        if (!Array.isArray(plants) || plants.length === 0) {
          // Try alternative response format
          const plantList = plantsResult?.data?.plants || plantsResult?.plants || [];
          if (!Array.isArray(plantList) || plantList.length === 0) {
            result = { success: true, data: { synced: 0 }, msg: "Nenhuma planta encontrada. Verifique seu token." };
            break;
          }
        }

        const plantArray = Array.isArray(plants) ? plants : (plantsResult?.data?.plants || plantsResult?.plants || []);
        const allDevices: any[] = [];

        for (const plant of plantArray) {
          const plantId = plant.id || plant.plant_id || plant.plantId;
          const plantName = plant.name || plant.plant_name || plant.plantName || "";
          
          try {
            const devResult = await growattRequest(apiUrl, apiToken, `/v1/device/list`, { plant_id: plantId });
            const devices = devResult?.data || devResult?.devices || devResult?.result?.devices || [];
            const deviceArray = Array.isArray(devices) ? devices : (devResult?.data?.devices || []);

            for (const dev of deviceArray) {
              allDevices.push({
                workspace_id,
                device_sn: dev.sn || dev.device_sn || dev.deviceSn || dev.serial_number || "",
                device_type: dev.type || dev.device_type || "inverter",
                plant_id: String(plantId),
                plant_name: plantName,
                device_model: dev.model || dev.device_model || null,
                is_active: true,
              });
            }
          } catch (e) {
            console.error(`Error fetching devices for plant ${plantId}:`, e);
          }
        }

        if (allDevices.length > 0) {
          await adminClient.from("growatt_inverters").upsert(allDevices, {
            onConflict: "workspace_id,device_sn",
          });
        }

        result = { success: true, data: { synced: allDevices.length, devices: allDevices } };
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
    console.error("growatt-proxy error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
