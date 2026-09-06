import { chromium } from "playwright";

async function auditNetwork() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const failedRequests = [];

  page.on("response", async (response) => {
    if (response.status() >= 400) {
      let bodyText = "";
      try {
        bodyText = await response.text();
      } catch (e) {}
      failedRequests.push({
        url: response.url(),
        status: response.status(),
        method: response.request().method(),
        body: bodyText.slice(0, 300)
      });
    }
  });

  const routes = ["/admin", "/investor", "/kam-dashboard", "/promoter", "/team-miniapp", "/secondary-market"];

  for (const r of routes) {
    console.log(`Auditing network for ${r}...`);
    try {
      await page.goto(`http://localhost:3000${r}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log(`Navigation error for ${r}: ${e.message}`);
    }
  }

  await browser.close();

  console.log("\n=== NETWORK AUDIT RESULTS ===");
  console.log(`Total Failed Requests (HTTP >= 400): ${failedRequests.length}`);
  if (failedRequests.length > 0) {
    console.log(JSON.stringify(failedRequests, null, 2));
    process.exit(1);
  } else {
    console.log("✅ ZERO NETWORK 400/404/500 ERRORS DETECTED!");
    process.exit(0);
  }
}

auditNetwork();
