const API = "https://opendata.immigration.gov.tw/APIS/TPE3";

export default {

  async fetch(request, env) {

    const url = new URL(request.url);

    // 手動測試網址：/collect

    if (url.pathname === "/collect") {

      const controller = new AbortController();

      // 30 秒內沒有回應就中止，避免一直卡住

      const timer = setTimeout(() => controller.abort(), 30000);

      try {

        const started = Date.now();

        const response = await fetch(API, {

          signal: controller.signal,

          headers: {

            "Accept": "application/json,text/plain,*/*",

            "User-Agent": "Mozilla/5.0 TransitNationalityCollector/1.0"

          }

        });

        clearTimeout(timer);

        const elapsedMs = Date.now() - started;

        const text = await response.text();

        if (!response.ok) {

          return Response.json(

            {

              ok: false,

              stage: "api",

              status: response.status,

              elapsedMs,

              message: text.slice(0, 300)

            },

            { status: 502 }

          );

        }

        let raw;

        try {

          raw = JSON.parse(text);

        } catch (error) {

          return Response.json(

            {

              ok: false,

              stage: "json",

              elapsedMs,

              message: "官方 API 有回應，但不是有效 JSON",

              preview: text.slice(0, 300)

            },

            { status: 502 }

          );

        }

        const rows = Array.isArray(raw)

          ? raw

          : Array.isArray(raw?.data)

          ? raw.data

          : [];

        return Response.json({

          ok: true,

          stage: "api-ok",

          source: API,

          elapsedMs,

          rows: rows.length,

          capturedAt: new Date().toISOString(),

          sample: rows.slice(0, 3)

        });

      } catch (error) {

        clearTimeout(timer);

        return Response.json(

          {

            ok: false,

            stage: "fetch",

            error: error?.name || "Error",

            message: error?.message || String(error)

          },

          { status: 502 }

        );

      }

    }

    return new Response(

      "Transit nationality collector is running. Add /collect to test the official API.",

      {

        status: 200,

        headers: {

          "content-type": "text/plain; charset=UTF-8"

        }

      }

    );

  }

};
