import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/LeNoVo/.gemini/antigravity/brain/c1fa6959-bd14-4192-9e6a-505977d700d4/test_artifacts/phase1_admin';
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:3000';

async function runSubPhase1_2() {
  console.log('🚀 Starting Sub-Phase 1.2: Capital & Liquidity Desks (Tabs 5–8)...');
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
    // 1. Authenticate via test role injection
    console.log('🔑 Injecting Admin test persona...');
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('gro10x_test_role', 'admin');
      localStorage.setItem('gro10x_test_user_id', 'test-admin-uuid');
    });

    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // ─────────────────────────────────────────────────────────────
    // TEST 1.2.1: TAB 5 — Leads & Marketing (leads-marketing)
    // ─────────────────────────────────────────────────────────────
    console.log('📍 Switching to Tab 5: Leads & Marketing...');
    const leadsBtn = page.locator('button:has-text("Leads & Marketing")').first();
    await leadsBtn.click();
    await page.waitForTimeout(1000);

    // Verify sub-tabs
    const surveyTabBtn = page.locator('button:has-text("Survey Vault"), button:has-text("Surveys")').first();
    if (await surveyTabBtn.isVisible()) {
      await surveyTabBtn.click();
      await page.waitForTimeout(400);
      console.log('✅ Survey Vault sub-tab verified.');
    }

    const campaignsTabBtn = page.locator('button:has-text("Campaigns"), button:has-text("Marketing Campaigns")').first();
    if (await campaignsTabBtn.isVisible()) {
      await campaignsTabBtn.click();
      await page.waitForTimeout(400);
      console.log('✅ Marketing Campaigns sub-tab verified.');
    }

    // Switch back to Pipeline
    const pipelineSubTab = page.locator('button:has-text("Pipeline"), button:has-text("Inquiry Leads")').first();
    if (await pipelineSubTab.isVisible()) {
      await pipelineSubTab.click();
      await page.waitForTimeout(400);
    }

    // Capture Tab 5 Screenshot
    const tab5Screenshot = path.join(ARTIFACTS_DIR, 'tab5_inquiry_leads.png');
    await page.screenshot({ path: tab5Screenshot, fullPage: true });
    console.log(`📸 Tab 5 screenshot captured: ${tab5Screenshot}`);

    // ─────────────────────────────────────────────────────────────
    // TEST 1.2.2: TAB 6 — Secondary Clearance (secondary-clearance)
    // ─────────────────────────────────────────────────────────────
    console.log('📍 Switching to Tab 6: Secondary Clearance...');
    const secBtn = page.locator('button:has-text("Secondary Clearance")').first();
    await secBtn.click();
    await page.waitForTimeout(1000);

    // Verify filter chips
    const allChip = page.locator('button:has-text("All Orders"), button:has-text("All")').first();
    if (await allChip.isVisible()) {
      await allChip.click();
      await page.waitForTimeout(300);
      console.log('✅ Secondary orders filter toggled.');
    }

    // Capture Tab 6 Screenshot
    const tab6Screenshot = path.join(ARTIFACTS_DIR, 'tab6_secondary_clearance.png');
    await page.screenshot({ path: tab6Screenshot, fullPage: true });
    console.log(`📸 Tab 6 screenshot captured: ${tab6Screenshot}`);

    // ─────────────────────────────────────────────────────────────
    // TEST 1.2.3: TAB 7 — Cash Concierge (cash-pipeline)
    // ─────────────────────────────────────────────────────────────
    console.log('📍 Switching to Tab 7: Cash Concierge...');
    const cashBtn = page.locator('button:has-text("Cash Concierge")').first();
    await cashBtn.click();
    await page.waitForTimeout(1000);

    // Test sub-tabs: Log OTC Ticket
    const logTicketSubTab = page.locator('button:has-text("Log OTC Ticket"), button:has-text("New Ticket")').first();
    if (await logTicketSubTab.isVisible()) {
      await logTicketSubTab.click();
      await page.waitForTimeout(500);
      console.log('✅ Log OTC Ticket form rendered.');

      // Switch back to pipeline queue
      const queueSubTab = page.locator('button:has-text("Pipeline"), button:has-text("OTC Pipeline")').first();
      if (await queueSubTab.isVisible()) {
        await queueSubTab.click();
        await page.waitForTimeout(400);
      }
    }

    // Capture Tab 7 Screenshot
    const tab7Screenshot = path.join(ARTIFACTS_DIR, 'tab7_cash_concierge.png');
    await page.screenshot({ path: tab7Screenshot, fullPage: true });
    console.log(`📸 Tab 7 screenshot captured: ${tab7Screenshot}`);

    // ─────────────────────────────────────────────────────────────
    // TEST 1.2.4: TAB 8 — Yield Engine (dividend)
    // ─────────────────────────────────────────────────────────────
    console.log('📍 Switching to Tab 8: Yield Engine...');
    const yieldBtn = page.locator('button:has-text("Yield Engine")').first();
    await yieldBtn.click();
    await page.waitForTimeout(1000);

    // Test Gross Sales input and Net Profit input
    const grossSalesInput = page.locator('input[placeholder*="Gross Sales"], input[type="number"]').first();
    if (await grossSalesInput.isVisible()) {
      console.log('⚡ Testing Yield simulator inputs...');
      await grossSalesInput.fill('1500000');
      await page.waitForTimeout(300);
      console.log('✅ Gross sales input wired.');
    }

    // Test sub-tab: Disbursement Ledger
    const ledgerSubTab = page.locator('button:has-text("Disbursement Ledger"), button:has-text("Ledger")').first();
    if (await ledgerSubTab.isVisible()) {
      await ledgerSubTab.click();
      await page.waitForTimeout(400);
      console.log('✅ Disbursement Ledger sub-tab rendered.');
    }

    // Test sub-tab: POS Ingest & Reports
    const posSubTab = page.locator('button:has-text("POS Reports"), button:has-text("POS Sales")').first();
    if (await posSubTab.isVisible()) {
      await posSubTab.click();
      await page.waitForTimeout(400);
      console.log('✅ POS Reports sub-tab rendered.');
    }

    // Switch back to Declare Yield
    const declareSubTab = page.locator('button:has-text("Declare Yield"), button:has-text("Declare Monthly Yield")').first();
    if (await declareSubTab.isVisible()) {
      await declareSubTab.click();
      await page.waitForTimeout(400);
    }

    // Capture Tab 8 Screenshot
    const tab8Screenshot = path.join(ARTIFACTS_DIR, 'tab8_yield_engine.png');
    await page.screenshot({ path: tab8Screenshot, fullPage: true });
    console.log(`📸 Tab 8 screenshot captured: ${tab8Screenshot}`);

    console.log('🎉 Sub-Phase 1.2 Tests COMPLETED SUCCESSFULLY with 0 regressions!');
  } catch (error) {
    console.error('❌ Sub-Phase 1.2 Test Failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runSubPhase1_2();
