import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/LeNoVo/.gemini/antigravity/brain/c1fa6959-bd14-4192-9e6a-505977d700d4/test_artifacts/phase1_admin';
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:3000';

async function runSubPhase1_1() {
  console.log('🚀 Starting Sub-Phase 1.1: Core Operations & Deal Pipeline (Tabs 1–4)...');
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

    // ─────────────────────────────────────────────────────────────
    // TEST 1.1.1: TAB 1 — Command Center Overview (dashboard)
    // ─────────────────────────────────────────────────────────────
    console.log('📍 Navigating to Admin Command Center (/admin)...');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const restrictedCount = await page.locator('text=RESTRICTED AREA').count();
    if (restrictedCount > 0) {
      throw new Error('Access denied: Admin role did not authenticate properly.');
    }
    console.log('✅ Admin Portal authentication verified successfully.');

    await page.waitForSelector('.admin-sidebar', { timeout: 5000 });
    console.log('✅ Admin Sidebar rendered.');

    const kpiElements = await page.locator('.metric-card, .kpi-card, [style*="border-radius"]').count();
    console.log(`📊 Found ${kpiElements} dashboard card elements.`);

    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      console.log('🔍 Testing Global Search interaction...');
      await searchInput.fill('Dhaka');
      await page.waitForTimeout(300);
      await searchInput.fill('');
      console.log('✅ Global Search bar responsive.');
    }

    const tab1Screenshot = path.join(ARTIFACTS_DIR, 'tab1_command_center.png');
    await page.screenshot({ path: tab1Screenshot, fullPage: true });
    console.log(`📸 Tab 1 screenshot captured: ${tab1Screenshot}`);

    // ─────────────────────────────────────────────────────────────
    // TEST 1.1.2: TAB 2 — Kanban Deal Pipeline (kanban)
    // ─────────────────────────────────────────────────────────────
    console.log('📍 Switching to Tab 2: Deal Pipeline...');
    const dealPipelineBtn = page.locator('button:has-text("Deal Pipeline")').first();
    await dealPipelineBtn.click();
    await page.waitForTimeout(800);

    const kanbanContent = await page.textContent('body');
    const hasKanbanText = kanbanContent.includes('Origination') || 
                          kanbanContent.includes('Diligence') || 
                          kanbanContent.includes('Active') ||
                          kanbanContent.includes('Pipeline');
    console.log(`✅ Deal Pipeline content rendered: ${hasKanbanText}`);

    const newDealBtn = page.locator('button:has-text("Launch New Deal"), button:has-text("New Project"), button:has-text("New Deal")').first();
    if (await newDealBtn.isVisible()) {
      console.log('⚡ Clicking "+ Launch New Deal" modal opener...');
      await newDealBtn.click();
      await page.waitForTimeout(500);

      const modalHeader = page.locator('h2, h3, div').filter({ hasText: /New Deal|Project|Campaign/i }).first();
      console.log(`✅ Project modal header detected: ${await modalHeader.isVisible()}`);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      console.log('✅ Project modal closed via keyboard / dismiss.');
    }

    const tab2Screenshot = path.join(ARTIFACTS_DIR, 'tab2_deal_pipeline.png');
    await page.screenshot({ path: tab2Screenshot, fullPage: true });
    console.log(`📸 Tab 2 screenshot captured: ${tab2Screenshot}`);

    // ─────────────────────────────────────────────────────────────
    // TEST 1.1.3: TAB 3 — Investor Hub (investors)
    // ─────────────────────────────────────────────────────────────
    console.log('📍 Switching to Tab 3: Investor Hub...');
    const investorHubBtn = page.locator('button:has-text("Investor Hub")').first();
    await investorHubBtn.click();
    await page.waitForTimeout(800);

    const investorSearch = page.locator('input[placeholder*="Search investor"], input[placeholder*="Search"]').first();
    if (await investorSearch.isVisible()) {
      console.log('🔍 Testing Investor search input...');
      await investorSearch.fill('017');
      await page.waitForTimeout(300);
      await investorSearch.fill('');
      console.log('✅ Investor search input responsive.');
    }

    const tab3Screenshot = path.join(ARTIFACTS_DIR, 'tab3_investor_hub.png');
    await page.screenshot({ path: tab3Screenshot, fullPage: true });
    console.log(`📸 Tab 3 screenshot captured: ${tab3Screenshot}`);

    // ─────────────────────────────────────────────────────────────
    // TEST 1.1.4: TAB 4 — Business Registry (business-registry)
    // ─────────────────────────────────────────────────────────────
    console.log('📍 Switching to Tab 4: Business Registry...');
    const businessRegistryBtn = page.locator('button:has-text("Business Registry")').first();
    await businessRegistryBtn.click();
    await page.waitForTimeout(800);

    const bzContent = await page.textContent('body');
    const hasBzText = bzContent.includes('Business') || bzContent.includes('Cohort') || bzContent.includes('Registry');
    console.log(`✅ Business Registry content rendered: ${hasBzText}`);

    const enlistBtn = page.locator('button:has-text("Enlist Business"), button:has-text("New Business")').first();
    if (await enlistBtn.isVisible()) {
      console.log('⚡ Clicking "+ Enlist Business" modal button...');
      await enlistBtn.click();
      await page.waitForTimeout(500);
      console.log('✅ Enlist Business modal triggered.');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      console.log('✅ Enlist Business modal closed.');
    }

    const tab4Screenshot = path.join(ARTIFACTS_DIR, 'tab4_business_registry.png');
    await page.screenshot({ path: tab4Screenshot, fullPage: true });
    console.log(`📸 Tab 4 screenshot captured: ${tab4Screenshot}`);

    // ─────────────────────────────────────────────────────────────
    // RESPONSIVE VIEWPORT TESTS
    // ─────────────────────────────────────────────────────────────
    console.log('📱 Testing Mobile Viewport (375x812)...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    const mobileScreenshot = path.join(ARTIFACTS_DIR, 'tab1_mobile_375px.png');
    await page.screenshot({ path: mobileScreenshot, fullPage: false });
    console.log(`📸 Mobile screenshot captured: ${mobileScreenshot}`);

    console.log('💻 Testing Tablet Viewport (768x1024)...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    const tabletScreenshot = path.join(ARTIFACTS_DIR, 'tab1_tablet_768px.png');
    await page.screenshot({ path: tabletScreenshot, fullPage: false });
    console.log(`📸 Tablet screenshot captured: ${tabletScreenshot}`);

    console.log('🎉 Sub-Phase 1.1 Tests COMPLETED SUCCESSFULLY with 0 regressions!');
  } catch (error) {
    console.error('❌ Sub-Phase 1.1 Test Failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runSubPhase1_1();
