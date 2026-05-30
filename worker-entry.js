// Wrapper around OpenNext worker to add scheduled (cron) handler
import openNextWorker from "./.open-next/worker.js";

// Re-export all named exports (Durable Objects, etc.)
export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Manual cron trigger — routes internally through OpenNext (no external fetch loop)
    if (url.pathname === "/__fire-cron" || url.pathname === "/__fire-test") {
      const cronSecret = env.CRON_SECRET;
      if (!cronSecret) {
        return new Response(JSON.stringify({ error: "CRON_SECRET not set" }), { status: 500 });
      }
      // Authenticate the incoming request
      const incomingAuth = request.headers.get("Authorization");
      if (incomingAuth !== `Bearer ${cronSecret}`) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
      }
      const headers = {
        "Authorization": `Bearer ${cronSecret}`,
        "Content-Type": "application/json",
      };
      const isTest = url.pathname === "/__fire-test";
      const results = {};

      try {
        const r1 = new Request("https://redzonecouple.site/api/daily-status", { method: "POST", headers });
        const resp1 = await openNextWorker.fetch(r1, env, ctx);
        results.dailyStatus = await resp1.json();
      } catch (err) { results.dailyStatus = { error: err.message }; }

      try {
        const notifUrl = isTest
          ? "https://redzonecouple.site/api/check-notification?test=all"
          : "https://redzonecouple.site/api/check-notification";
        const r2 = new Request(notifUrl, { method: "POST", headers });
        const resp2 = await openNextWorker.fetch(r2, env, ctx);
        results.checkNotification = await resp2.json();
      } catch (err) { results.checkNotification = { error: err.message }; }

      return new Response(JSON.stringify(results, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return openNextWorker.fetch(request, env, ctx);
  },

  // Cron trigger: runs every hour (0 * * * *)
  async scheduled(event, env, ctx) {
    const cronSecret = env.CRON_SECRET;
    if (!cronSecret) {
      console.error("CRON_SECRET not set — skipping scheduled tasks");
      return;
    }

    const headers = {
      "Authorization": `Bearer ${cronSecret}`,
      "Content-Type": "application/json",
    };

    // 1. Daily status (Telegram daily updates at user-configured hours)
    try {
      const r1 = new Request("https://redzonecouple.site/api/daily-status", { method: "POST", headers });
      const resp = await openNextWorker.fetch(r1, env, ctx);
      const data = await resp.json();
      console.log("Daily status cron result:", JSON.stringify(data));
    } catch (err) {
      console.error("Daily status cron failed:", err);
    }

    // 2. Context Zone alerts (email + Telegram when user enters context zone)
    try {
      const r2 = new Request("https://redzonecouple.site/api/check-notification", { method: "POST", headers });
      const resp = await openNextWorker.fetch(r2, env, ctx);
      const data = await resp.json();
      console.log("Check notification cron result:", JSON.stringify(data));
    } catch (err) {
      console.error("Check notification cron failed:", err);
    }
  },
};
