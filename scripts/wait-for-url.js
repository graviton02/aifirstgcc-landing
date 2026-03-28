const [targetUrl] = process.argv.slice(2);

if (!targetUrl) {
  console.error("Usage: node scripts/wait-for-url.js <url>");
  process.exit(1);
}

const timeoutMs = Number(process.env.WAIT_FOR_URL_TIMEOUT_MS ?? 180_000);
const intervalMs = Number(process.env.WAIT_FOR_URL_INTERVAL_MS ?? 5_000);
const deadline = Date.now() + timeoutMs;

async function waitForUrl(url) {
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
      });

      if (response.ok) {
        console.log(`Preview is ready at ${url}`);
        return;
      }

      console.log(`Waiting for ${url}. Received HTTP ${response.status}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`Waiting for ${url}. Request failed: ${message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  console.error(`Timed out waiting for ${targetUrl} after ${timeoutMs}ms.`);
  process.exit(1);
}

await waitForUrl(targetUrl);
