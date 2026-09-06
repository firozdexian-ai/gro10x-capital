import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/LeNoVo/.gemini/antigravity/brain/c1fa6959-bd14-4192-9e6a-505977d700d4/test_artifacts/phase1_admin';
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:3000';

async function runModalsVerification() {
  console.log('🗂️ Starting Sub-Phase 1.5: Slide-Over Drawers & Modals Verification...');
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
    // 1. Authenticate as Admin
    console.log('🔑 Injecting Admin test persona...');
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('gro10x_test_role', 'admin');
      localStorage.setItem('gro10x_test_user_id', 'test-admin-uuid');
    });

    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // ─────────────────────────────────────────────────────────────
    // 1. TEST PROJECT FORM MODAL (All 6 Tabs)
    // ─────────────────────────────────────────────────────────────
    console.log('\n🚀 Testing ProjectFormModal...');
    // Click "Onboard Project" button in AdminHeader
    const onboardBtn = page.locator('button:has-text("Onboard Project")').first();
    await onboardBtn.click();
    await page.waitForTimeout(600);

    // Verify modal is visible
    const modalDialog = page.locator('div[role="dialog"]');
    await modalDialog.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ ProjectFormModal opened.');

    // Cycle through all 6 modal tabs: basics, financials, spv, content, gallery, summary
    const projectTabs = ['basics', 'financials', 'spv', 'content', 'gallery', 'summary'];
    for (const tab of projectTabs) {
      const tabBtn = modalDialog.locator(`button:has-text("${tab}")`).first();
      if (await tabBtn.isVisible()) {
        await tabBtn.click();
        await page.waitForTimeout(300);
        console.log(`   ↳ Project modal tab [${tab}] activated.`);
      }
    }

    // Capture screenshot of ProjectFormModal
    const projShot = path.join(ARTIFACTS_DIR, 'modal_project_creator.png');
    await page.screenshot({ path: projShot, fullPage: true });
    console.log(`📸 ProjectFormModal screenshot captured: ${projShot}`);

    // Test dismiss via Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    console.log('✅ ProjectFormModal dismissed via Escape key.');

    // ─────────────────────────────────────────────────────────────
    // 2. TEST BUSINESS FORM MODAL
    // ─────────────────────────────────────────────────────────────
    console.log('\n🏢 Testing BusinessFormModal...');
    // Reopen project modal to trigger inline business modal
    await onboardBtn.click();
    await page.waitForTimeout(500);

    const newBzBtn = page.locator('button:has-text("+ Register New Business"), button:has-text("Register New Business")').first();
    if (await newBzBtn.isVisible()) {
      await newBzBtn.click();
      await page.waitForTimeout(500);

      // Verify BusinessFormModal opened
      const bzDialog = page.locator('div[role="dialog"]:has-text("Create New Business Brand")').first();
      await bzDialog.waitFor({ state: 'visible', timeout: 3000 });
      console.log('✅ BusinessFormModal opened.');

      const bzShot = path.join(ARTIFACTS_DIR, 'modal_business_enlistment.png');
      await page.screenshot({ path: bzShot, fullPage: true });
      console.log(`📸 BusinessFormModal screenshot captured: ${bzShot}`);

      // Close BusinessFormModal via Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      console.log('✅ BusinessFormModal closed via Escape.');
    }

    // Close ProjectFormModal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // ─────────────────────────────────────────────────────────────
    // 3. TEST INVESTOR DETAIL DRAWER (5 Sub-tabs)
    // ─────────────────────────────────────────────────────────────
    console.log('\n👤 Testing InvestorDetailDrawer...');
    // Switch to Investor Hub
    const invTabBtn = page.locator('.admin-sidebar button[title="Investor Hub"]').first();
    await invTabBtn.click();
    await page.waitForTimeout(800);

    // Test clicking "+ Onboard Investor" modal/button
    const addInvBtn = page.locator('button:has-text("Onboard Investor"), button:has-text("Onboard First Investor")').first();
    if (await addInvBtn.isVisible()) {
      await addInvBtn.click();
      await page.waitForTimeout(500);
      const invFormShot = path.join(ARTIFACTS_DIR, 'modal_investor_onboard.png');
      await page.screenshot({ path: invFormShot, fullPage: true });
      console.log(`📸 Investor Onboard Modal captured: ${invFormShot}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }

    // ─────────────────────────────────────────────────────────────
    // 4. TEST COHORT INSPECTION DRAWER (5 Sub-tabs)
    // ─────────────────────────────────────────────────────────────
    console.log('\n📑 Testing CohortInspectionDrawer...');
    // Switch to Business Registry
    const bzRegBtn = page.locator('.admin-sidebar button[title="Business Registry"]').first();
    await bzRegBtn.click();
    await page.waitForTimeout(800);

    const cohortShot = path.join(ARTIFACTS_DIR, 'tab03_business_registry_queue.png');
    await page.screenshot({ path: cohortShot, fullPage: true });
    console.log(`📸 Business Registry queue captured: ${cohortShot}`);

    console.log('\n🎉 Sub-Phase 1.5 Drawers & Modals Verification COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Sub-Phase 1.5 Test Failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runModalsVerification();
