/**
 * Keep-Alive Job
 *
 * Render.com free tier spins down services after ~15 minutes of inactivity,
 * causing the next real request to wait 30-60 seconds for a cold start.
 *
 * This job pings the API's own /health endpoint every 14 minutes so the
 * server never goes idle long enough to be spun down.
 *
 * Only active in production to avoid unnecessary noise in development.
 */
export class KeepAliveJob {
  static async run(): Promise<void> {
    // Only run in production (Render environment)
    if (process.env.NODE_ENV !== 'production') return;

    const apiUrl = process.env.API_URL || process.env.RENDER_EXTERNAL_URL;
    if (!apiUrl) {
      console.warn('[KeepAlive] No API_URL or RENDER_EXTERNAL_URL set — skipping ping.');
      return;
    }

    const target = `${apiUrl.replace(/\/$/, '')}/health`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000); // 10s timeout

      const response = await fetch(target, { signal: controller.signal });
      clearTimeout(timeout);

      console.log(`✅ [KeepAlive] Pinged ${target} → ${response.status}`);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('[KeepAlive] Ping timed out after 10s.');
      } else {
        console.error('[KeepAlive] Ping failed:', error.message);
      }
    }
  }
}
