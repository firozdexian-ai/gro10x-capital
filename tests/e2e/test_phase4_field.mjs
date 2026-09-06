import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/LeNoVo/.gemini/antigravity/brain/c1fa6959-bd14-4192-9e6a-505977d700d4/test_artifacts/phase4_field';
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:3000';

async function runPhase4FieldTests() {
  console.log('🎖️ Starting Phase 4: Field Operations Desks (KAM, Promoter & Payouts) Verification...');
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
    // TEST 4.1: KAM DASHBOARD (/kam-dashboard) (5 Tabs)
    // ─────────────────────────────────────────────────────────────
    console.log('\n👔 Injecting KAM Persona & Navigating to /kam-dashboard...');
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('gro10x_test_role', 'kam');
      localStorage.setItem('gro10x_test_user_id', '00000000-0000-0000-0000-000000000001');
    });

    await page.goto(`${BASE_URL}/kam-dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const kamAuditShot = path.join(ARTIFACTS_DIR, 'kam_audits_tab.png');
    await page.screenshot({ path: kamAuditShot, fullPage: true });
    console.log(`📸 KAM Audits tab captured: ${kamAuditShot}`);

    // Cycle through KAM Tabs: investors, projects, yield, cash
    const kamTabs = [
      { name: 'Assigned Investors', file: 'kam_investors_tab.png' },
      { name: 'CapEx Projects', file: 'kam_projects_tab.png' },
      { name: 'Yield Verification', file: 'kam_yield_tab.png' },
      { name: 'Cash Pipeline', file: 'kam_cash_tab.png' }
    ];

    for (const t of kamTabs) {
      const tabBtn = page.locator(`button:has-text("${t.name}")`).first();
      if (await tabBtn.isVisible()) {
        console.log(`   ↳ Switching to ${t.name} tab...`);
        await tabBtn.click();
        await page.waitForTimeout(500);
        const tabShot = path.join(ARTIFACTS_DIR, t.file);
        await page.screenshot({ path: tabShot, fullPage: true });
        console.log(`   📸 Captured ${t.name}: ${tabShot}`);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 4.2: PROMOTER PORTAL (/promoter) (4 Tabs)
    // ─────────────────────────────────────────────────────────────
    console.log('\n🚀 Injecting Promoter Persona & Navigating to /promoter...');
    await page.evaluate(() => {
      localStorage.setItem('gro10x_test_role', 'promoter');
      localStorage.setItem('gro10x_test_user_id', '00000000-0000-0000-0000-000000000001');
    });

    await page.goto(`${BASE_URL}/promoter`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const promoterLeadsShot = path.join(ARTIFACTS_DIR, 'promoter_leads_tab.png');
    await page.screenshot({ path: promoterLeadsShot, fullPage: true });
    console.log(`📸 Promoter Leads tab captured: ${promoterLeadsShot}`);

    // Cycle through Promoter Tabs: targets, earnings, payouts
    const promoterTabs = [
      { name: 'Targets & Quotas', file: 'promoter_targets_tab.png' },
      { name: 'Commission Earnings', file: 'promoter_earnings_tab.png' },
      { name: 'Payout Requests', file: 'promoter_payouts_tab.png' }
    ];

    for (const t of promoterTabs) {
      const tabBtn = page.locator(`button:has-text("${t.name}")`).first();
      if (await tabBtn.isVisible()) {
        console.log(`   ↳ Switching to ${t.name} tab...`);
        await tabBtn.click();
        await page.waitForTimeout(500);
        const tabShot = path.join(ARTIFACTS_DIR, t.file);
        await page.screenshot({ path: tabShot, fullPage: true });
        console.log(`   📸 Captured ${t.name}: ${tabShot}`);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 4.3: PAYOUTS CLEARANCE DESK (/payouts)
    // ─────────────────────────────────────────────────────────────
    console.log('\n💳 Navigating to Commission Payouts Desk (/payouts)...');
    await page.goto(`${BASE_URL}/payouts`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const payoutsShot = path.join(ARTIFACTS_DIR, 'payouts_clearance_desk.png');
    await page.screenshot({ path: payoutsShot, fullPage: true });
    console.log(`📸 Payouts Desk captured: ${payoutsShot}`);

    console.log('\n🎉 Phase 4: Field Operations Desks Tests COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Phase 4 Test Failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPhase4FieldTests();
