import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/LeNoVo/.gemini/antigravity/brain/c1fa6959-bd14-4192-9e6a-505977d700d4/test_artifacts/phase3_founder';
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:3000';

async function runPhase3FounderTests() {
  console.log('🏭 Starting Phase 3: SME Founder Portal & Cohort Funnel Verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`[Browser Console Error] ${msg.text()}`);
  });
  page.on('pageerror', err => console.log(`[Browser Page Error] ${err.message}`));

  try {
    // ─────────────────────────────────────────────────────────────
    // TEST 3.1: SME COHORT APPLICATION WIZARD (/apply)
    // ─────────────────────────────────────────────────────────────
    console.log('\n📝 Navigating to SME Application Wizard (/apply)...');
    await page.goto(`${BASE_URL}/apply`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const step1Shot = path.join(ARTIFACTS_DIR, 'cohort_apply_step1.png');
    await page.screenshot({ path: step1Shot, fullPage: true });
    console.log(`📸 Cohort Application Step 1 captured: ${step1Shot}`);

    // Test filling Step 1 and advancing to Step 2
    const brandInput = page.locator('input[placeholder*="Brand"], input[placeholder*="ORO"]').first();
    if (await brandInput.isVisible()) {
      await brandInput.fill('Crimson Cup Franchise');
      const nextBtn = page.locator('button:has-text("Next"), button:has-text("Founding Team")').first();
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForTimeout(600);
        const step2Shot = path.join(ARTIFACTS_DIR, 'cohort_apply_step2.png');
        await page.screenshot({ path: step2Shot, fullPage: true });
        console.log(`📸 Cohort Application Step 2 captured: ${step2Shot}`);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 3.2: COHORT APPLICATION STATUS TRACKER (/apply/status)
    // ─────────────────────────────────────────────────────────────
    console.log('\n🔍 Navigating to Cohort Status Tracker (/apply/status)...');
    await page.goto(`${BASE_URL}/apply/status`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const statusShot = path.join(ARTIFACTS_DIR, 'cohort_status_lookup.png');
    await page.screenshot({ path: statusShot, fullPage: true });
    console.log(`📸 Cohort Status Tracker captured: ${statusShot}`);

    // ─────────────────────────────────────────────────────────────
    // TEST 3.3: BUSINESS FOUNDER PORTAL (/business)
    // ─────────────────────────────────────────────────────────────
    console.log('\n🏢 Testing Founder Executive Hub (/business)...');
    // Inject Founder/Admin Persona
    await page.evaluate(() => {
      localStorage.setItem('gro10x_test_role', 'admin');
      localStorage.setItem('gro10x_test_user_id', '00000000-0000-0000-0000-000000000001');
    });

    await page.goto(`${BASE_URL}/business`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const bzShot = path.join(ARTIFACTS_DIR, 'business_campaign_tab.png');
    await page.screenshot({ path: bzShot, fullPage: true });
    console.log(`📸 Business Portal (Campaign Tab) captured: ${bzShot}`);

    // Cycle through Founder Tabs: captable, pos
    const capTableBtn = page.locator('button:has-text("Cap Table"), button:has-text("Investors")').first();
    if (await capTableBtn.isVisible()) {
      await capTableBtn.click();
      await page.waitForTimeout(500);
      const capShot = path.join(ARTIFACTS_DIR, 'business_captable_tab.png');
      await page.screenshot({ path: capShot, fullPage: true });
      console.log(`📸 Cap Table Tab captured: ${capShot}`);
    }

    const posTelemetryBtn = page.locator('button:has-text("POS Telemetry"), button:has-text("POS Sales")').first();
    if (await posTelemetryBtn.isVisible()) {
      await posTelemetryBtn.click();
      await page.waitForTimeout(500);
      const posShot = path.join(ARTIFACTS_DIR, 'business_pos_tab.png');
      await page.screenshot({ path: posShot, fullPage: true });
      console.log(`📸 POS Telemetry Tab captured: ${posShot}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 3.4: LIVE POS TELEMETRY TERMINAL (/pos-sync)
    // ─────────────────────────────────────────────────────────────
    console.log('\n📊 Navigating to Live POS Ingestion Terminal (/pos-sync)...');
    await page.goto(`${BASE_URL}/pos-sync`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const posSyncShot = path.join(ARTIFACTS_DIR, 'pos_sync_terminal.png');
    await page.screenshot({ path: posSyncShot, fullPage: true });
    console.log(`📸 POS Sync Terminal captured: ${posSyncShot}`);

    console.log('\n🎉 Phase 3: SME Founder Portal & Cohort Funnel Tests COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Phase 3 Test Failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPhase3FounderTests();
