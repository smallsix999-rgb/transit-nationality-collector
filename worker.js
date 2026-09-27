const API = "https://opendata.immigration.gov.tw/APIS/TPE3";

export default {

  async fetch(request, env) {

    const url = new URL(request.url);

    // 手動測試網址：/collect

    if (url.pathname === "/collect") {

      try {

        const controller = new AbortController();

        const timer = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(API, {

          signal: controller.signal,

          headers: {

            "Accept": "application/json,text/plain,*/*",

            "User-Agent": "Mozilla/5.0 TransitNationalityCollector/1.0"

          }

        });

        clearTimeout(timer);

        const text = await response.text();

        if (!response.ok) {

          return Response.json({

            ok: false,

            stage: "official-api",

            status: response.status,

            message: text.slice(0, 300)

          }, { status: 502 });

        }

        let data;

        try {

          data = JSON.parse(text);

        } catch (error) {

          return Response.json({

            ok: false,

            stage: "json",

            message: "官方資料不是有效的 JSON",

            preview: text.slice(0, 300)

          }, { status: 502 });

        }

        const rows = Array.isArray(data)

          ? data

          : Array.isArray(data?.data)

            ? data.data

            : [];

        return Response.json({

          ok: true,

          capturedAt: new Date().toISOString(),

          rows: rows.length,

          sample: rows.slice(0, 3)

        });

      } catch (error) {

        return Response.json({

          ok: false,

          stage: "fetch",

          error: error?.name || "Error",

          message: error?.message || String(error)

        }, { status: 502 });

      }

    }

    return new Response(

      "Transit nationality collector is running.",

      { status: 200 }

    );

  }

};
