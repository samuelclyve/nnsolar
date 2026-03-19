import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Huawei FusionSolar iMaster NetEco Northbound API
// Auth: POST /thirdData/login → returns XSRF-TOKEN cookie
let cachedTokens: Record<string, { token: string; expires: number }> = {};

async function huaweiLogin(apiUrl: string, username: string, password: string): Promise<string> {
  const cacheKey = `${apiUrl}:${username}`;
  const cached = cachedTokens[cacheKey];
  if (cached && cached.expires > Date.now()) return cached.token;

  const resp = await fetch(`${apiUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName: username, systemCode: password }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Huawei login failed [${resp.status}]: ${text}`);
  }

  const data = await resp.json();
  if (data.failCode === 305) throw new Error("Huawei: Credenciais inválidas");
  if (data.failCode === 407) throw new Error("Huawei: Muitas tentativas. Aguarde 5 minutos.");
  if (data.failCode && data.failCode !== 0) throw new Error(`Huawei error: ${data.failCode} - ${data.message || ""}`);

  // Token from Set-Cookie header (XSRF-TOKEN)
  const cookies = resp.headers.get("set-cookie") || "";
  const xsrfMatch = cookies.match(/XSRF-TOKEN=([^;]+)/);
  const token = xsrfMatch ? xsrfMatch[1] : "";

  if (!token) throw new Error("Huawei: Token não encontrado na resposta");

  // Cache for 25 minutes (token valid ~30min)
  cachedTokens[cacheKey] = { token, expires: Date.now() + 25 * 60 * 1000 };
  return token;
}

async function huaweiRequest(apiUrl: string, token: string, endpoint: string, body: Record<string, any> = {}) {
  const resp = await fetch(`${apiUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "XSRF-TOKEN": token,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Huawei API error [${resp.status}]: ${text}`);
  }

  const data = await resp.json();
  if (data.failCode && data.failCode !== 0) {
    throw new Error(`Huawei API: ${data.failCode} - ${data.message || "Erro desconhecido"}`);
  }
  return data;
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
      .from("huawei_credentials")
      .select("*")
      .eq("workspace_id", workspace_id)
      .eq("is_active", true)
      .maybeSingle();

    if (!creds) {
      return new Response(
        JSON.stringify({ error: "Huawei FusionSolar não configurado." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = await huaweiLogin(creds.api_url, creds.username, creds.password);
    let result: any;

    switch (action) {
      case "stationList": {
        result = await huaweiRequest(creds.api_url, token, "/getStationList", { pageNo: 1, pageSize: 100 });
        break;
      }

      case "stationDetail": {
        result = await huaweiRequest(creds.api_url, token, "/getStationRealKpi", {
          stationCodes: params.stationCode,
        });
        break;
      }

      case "deviceList": {
        result = await huaweiRequest(creds.api_url, token, "/getDevList", {
          stationCodes: params.stationCode,
        });
        break;
      }

      case "deviceDetail": {
        result = await huaweiRequest(creds.api_url, token, "/getDevRealKpi", {
          devIds: params.deviceId,
          devTypeId: params.devTypeId || 1, // 1 = inverter
        });
        break;
      }

      case "deviceHistory": {
        result = await huaweiRequest(creds.api_url, token, "/getKpiStationHour", {
          stationCodes: params.stationCode,
          collectTime: params.collectTime || Date.now(),
        });
        break;
      }

      case "deviceAlarms": {
        result = await huaweiRequest(creds.api_url, token, "/getAlarmList", {
          stationCodes: params.stationCode,
          beginTime: params.beginTime || (Date.now() - 24 * 60 * 60 * 1000),
          endTime: params.endTime || Date.now(),
          pageNo: 1,
          pageSize: 100,
        });
        break;
      }

      case "syncDevices": {
        const stationsResp = await huaweiRequest(creds.api_url, token, "/getStationList", { pageNo: 1, pageSize: 100 });
        const stations = stationsResp?.data?.list || [];
        const allDevices: any[] = [];

        for (const station of stations) {
          const stationCode = station.stationCode;
          const stationName = station.stationName || "";
          try {
            const devResp = await huaweiRequest(creds.api_url, token, "/getDevList", { stationCodes: stationCode });
            const devices = devResp?.data || [];
            for (const dev of (Array.isArray(devices) ? devices : [])) {
              if (dev.devTypeId === 1 || dev.devTypeId === 38 || dev.devTypeId === 47) {
                allDevices.push({
                  workspace_id,
                  device_id: String(dev.id || dev.devId),
                  device_sn: dev.esnCode || dev.devSn || String(dev.id),
                  station_code: stationCode,
                  station_name: stationName,
                  device_model: dev.devModel || dev.softwareVersion || null,
                  device_type: dev.devTypeId === 1 ? "inverter" : dev.devTypeId === 38 ? "battery" : "optimizer",
                  is_active: true,
                });
              }
            }
          } catch (e) {
            console.error(`Error fetching devices for station ${stationCode}:`, e);
          }
        }

        if (allDevices.length > 0) {
          await adminClient.from("huawei_inverters").upsert(allDevices, {
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
    console.error("huawei-proxy error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
