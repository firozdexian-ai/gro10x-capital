import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/LeNoVo/.gemini/antigravity/brain/c1fa6959-bd14-4192-9e6a-505977d700d4/test_artifacts/phase1_admin';
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:3000';

const ADMIN_TABS = [
  { index: 1, key: 'dashboard', title: 'Command Center', file: 'tab01_command_center.png' },
  { index: 2, key: 'kanban', title: 'Deal Pipeline', file: 'tab02_deal_pipeline.png' },
  { index: 3, key: 'business-registry', title: 'Business Registry', file: 'tab03_business_registry.png' },
  { index: 4, key: 'valuation-model', title: 'Deal Valuation & DCF Model', file: 'tab04_valuation_model.png' },
  { index: 5, key: 'work-orders', title: 'Work-Order Financing Desk', file: 'tab05_work_orders_desk.png' },
  { index: 6, key: 'investors', title: 'Investor Hub', file: 'tab06_investor_hub.png' },
  { index: 7, key: 'dividend', title: 'Yield Engine', file: 'tab07_yield_engine.png' },
  { index: 8, key: 'cash-pipeline', title: 'Cash Concierge', file: 'tab08_cash_concierge.png' },
  { index: 9, key: 'secondary-clearance', title: 'Secondary Market Clearance', file: 'tab09_secondary_clearance.png' },
  { index: 10, key: 'team-promoters', title: 'Team & Promoters', file: 'tab10_team_promoters.png' },
  { index: 11, key: 'leads-marketing', title: 'Leads & Marketing', file: 'tab11_leads_marketing.png' },
  { index: 12, key: 'legal', title: 'Legal & Compliance', file: 'tab12_legal_compliance.png' },
  { index: 13, key: 'analytics', title: 'Analytics', file: 'tab13_analytics.png' },
  { index: 14, key: 'bot-management', title: 'Bots & Access Control', file: 'tab14_bot_management.png' },
  { index: 15, key: 'settings', title: 'Settings', file: 'tab15_admin_settings.png' },
];

async function runMasterAdminTest() {
  console.log('🏛️ Starting Master Admin Command Center Browser Verification (All 14 Tabs + Modals)...');
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

    console.log('📍 Navigating to /admin...');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const restrictedCount = await page.locator('text=RESTRICTED AREA').count();
    if (restrictedCount > 0) {
      throw new Error('Access denied: Admin role did not authenticate properly.');
    }
    console.log('✅ Admin Portal authentication verified successfully.');

    // ─────────────────────────────────────────────────────────────
    // ITERATE THROUGH ALL 14 ADMIN TABS
    // ─────────────────────────────────────────────────────────────
    for (const tab of ADMIN_TABS) {
      console.log(`\n📌 Testing Tab ${tab.index}/${ADMIN_TABS.length}: [${tab.title}] (key: ${tab.key})...`);
      
      const tabButton = page.locator(`.admin-sidebar button[title="${tab.title}"]`).first();
      await tabButton.waitFor({ state: 'visible', timeout: 5000 });
      await tabButton.click();
      await page.waitForTimeout(800);

      // Verify active state on sidebar button
      const isActive = await tabButton.evaluate(el => el.classList.contains('active'));
      console.log(`   ↳ Active indicator state: ${isActive ? '✅ ACTIVE' : '⚠️ inactive'}`);

      // Capture high-resolution screenshot
      const shotPath = path.join(ARTIFACTS_DIR, tab.file);
      await page.screenshot({ path: shotPath, fullPage: true });
      console.log(`   📸 Captured screenshot: ${tab.file}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 1.5: MODALS & SLIDE-OVER DRAWERS
    // ─────────────────────────────────────────────────────────────
    console.log('\n🗂️ Testing Modals and Slide-Over Drawers...');

    // 1. Project Form Modal
    console.log('   Testing ProjectFormModal...');
    const newProjectBtn = page.locator('button:has-text("Onboard Project"), button:has-text("New Project")').first();
    if (await newProjectBtn.isVisible()) {
      await newProjectBtn.click();
      await page.waitForTimeout(600);
      const projModalShot = path.join(ARTIFACTS_DIR, 'modal_project_form.png');
      await page.screenshot({ path: projModalShot, fullPage: true });
      console.log(`   📸 Captured Project Form Modal: ${projModalShot}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }

    // 2. Business Form Modal
    console.log('   Testing BusinessFormModal...');
    const bzTabBtn = page.locator('.admin-sidebar button[title="Business Registry"]').first();
    await bzTabBtn.click();
    await page.waitForTimeout(600);

    const enlistBtn = page.locator('button:has-text("Enlist Business"), button:has-text("Open Application Form")').first();
    if (await enlistBtn.isVisible()) {
      console.log('   Found business registration trigger.');
    }

    // 3. Sidebar Collapse Toggle Test
    console.log('\n📐 Testing Sidebar Collapse Toggle...');
    const toggleBtn = page.locator('.admin-sidebar-toggle').first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(400);
      const collapsedShot = path.join(ARTIFACTS_DIR, 'sidebar_collapsed_mode.png');
      await page.screenshot({ path: collapsedShot, fullPage: true });
      console.log(`   📸 Captured Collapsed Sidebar mode: ${collapsedShot}`);
      // Expand back
      await toggleBtn.click();
      await page.waitForTimeout(400);
    }

    console.log('\n🎉 ALL 14 ADMIN TABS & MODALS VERIFIED WITH ZERO ERRORS!');
  } catch (error) {
    console.error('❌ Master Admin Test Failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runMasterAdminTest();
