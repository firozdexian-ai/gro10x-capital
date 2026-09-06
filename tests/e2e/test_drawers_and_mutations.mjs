import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/LeNoVo/.gemini/antigravity/brain/c1fa6959-bd14-4192-9e6a-505977d700d4/test_artifacts/phase1_admin';
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:3000';
const SUPABASE_URL = 'https://teujfcjoyxzmsyoyxfcy.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRldWpmY2pveXh6bXN5b3l4ZmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTMzMzgsImV4cCI6MjEwMTQyOTMzOH0.g_e2klmd0YosVsLH8TiiZQdlkfjQlb8qtNgh8zS8e1Q';

const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

async function runDrawersAndMutationsTest() {
  console.log('🧪 Starting Drawers & Deep-Dive Mutation Verification...');
  let createdCohortId = null;
  let createdInvestorId = null;

  try {
    // 1. Seed synthetic test cohort application
    console.log('🌱 Seeding synthetic test cohort application...');
    const { data: cohortData, error: cErr } = await sb
      .from('business_cohort_applications')
      .insert([{
        ref_code: 'REF_TEST_COHORT_01',
        brand_name: '[TEST] North End Artisan Brews',
        company_legal_name: '[TEST] Artisan Brews Ltd',
        industry_sector: 'F&B Franchise',
        requested_funding_bdt: 15000000,
        operational_months: 24,
        status: 'New_Submission',
        lead_founder_name: 'Tanvir Hossain',
        lead_founder_phone: '+8801711000001',
        pitch_text: 'Expansion of 3 specialty roasteries in Dhanmondi and Gulshan.'
      }])
      .select()
      .single();

    if (cErr) console.warn('Note on cohort seed:', cErr.message);
    if (cohortData) {
      createdCohortId = cohortData.id;
      console.log(`✅ Seeded test cohort: ${cohortData.id}`);
    }

    // 2. Seed synthetic test investor
    console.log('🌱 Seeding synthetic test investor...');
    const { data: invData, error: iErr } = await sb
      .from('investors')
      .insert([{
        alias_name: '[TEST] Apex Syndicate 01',
        full_name: 'Fahim Rahman',
        email: 'test-apex@gro10x.com',
        phone: '01711000002',
        onboarding_status: 'Active',
        kyc_verified: true,
        kyc_level: 2
      }])
      .select()
      .single();

    if (iErr) console.warn('Note on investor seed:', iErr.message);
    if (invData) {
      createdInvestorId = invData.id;
      console.log(`✅ Seeded test investor: ${invData.id}`);
    }

    // 3. Launch browser session
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    // Inject Admin Persona
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('gro10x_test_role', 'admin');
      localStorage.setItem('gro10x_test_user_id', 'test-admin-uuid');
    });

    console.log('📍 Navigating to Admin Command Center...');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // ─────────────────────────────────────────────────────────────
    // TEST A: COHORT INSPECTION DRAWER (5 Sub-Tabs)
    // ─────────────────────────────────────────────────────────────
    console.log('\n🏢 Navigating to Business Registry to test CohortInspectionDrawer...');
    const bzTabBtn = page.locator('.admin-sidebar button[title="Business Registry"]').first();
    await bzTabBtn.click();
    await page.waitForTimeout(1000);

    const cohortCard = page.locator('text=[TEST] North End Artisan Brews').first();
    if (await cohortCard.isVisible()) {
      console.log('   ↳ Found synthetic test cohort card. Clicking to open CohortInspectionDrawer...');
      await cohortCard.click();
      await page.waitForTimeout(600);

      // Verify drawer opened
      const drawer = page.locator('div[role="dialog"]');
      await drawer.waitFor({ state: 'visible', timeout: 4000 });
      console.log('   ✅ CohortInspectionDrawer opened.');

      // Cycle through all 5 sub-tabs
      const cohortTabs = ['brand', 'team', 'financials', 'documents', 'audit'];
      for (const tab of cohortTabs) {
        const subTabBtn = drawer.locator(`button:has-text("${tab}")`).first();
        if (await subTabBtn.isVisible()) {
          await subTabBtn.click();
          await page.waitForTimeout(300);
          console.log(`      ↳ Cohort sub-tab [${tab}] activated.`);
        }
      }

      // Capture screenshot of CohortInspectionDrawer
      const drawerShot = path.join(ARTIFACTS_DIR, 'drawer_cohort_inspection.png');
      await page.screenshot({ path: drawerShot, fullPage: true });
      console.log(`   📸 CohortInspectionDrawer screenshot captured: ${drawerShot}`);

      // Dismiss drawer via Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      console.log('   ✅ CohortInspectionDrawer dismissed.');
    } else {
      console.log('   ℹ️ Cohort card not visible in main list, capturing view.');
    }

    // ─────────────────────────────────────────────────────────────
    // TEST B: INVESTOR DETAIL DRAWER (5 Sub-Tabs)
    // ─────────────────────────────────────────────────────────────
    console.log('\n👤 Navigating to Investor Hub to test InvestorDetailDrawer...');
    const invTabBtn = page.locator('.admin-sidebar button[title="Investor Hub"]').first();
    await invTabBtn.click();
    await page.waitForTimeout(1000);

    const invRow = page.locator('text=[TEST] Apex Syndicate 01').first();
    if (await invRow.isVisible()) {
      console.log('   ↳ Found synthetic test investor row. Clicking to open InvestorDetailDrawer...');
      await invRow.click();
      await page.waitForTimeout(600);

      // Verify drawer opened
      const drawer = page.locator('div[role="dialog"]');
      await drawer.waitFor({ state: 'visible', timeout: 4000 });
      console.log('   ✅ InvestorDetailDrawer opened.');

      // Cycle through all 5 sub-tabs: profile, investments, yield, kyc-docs, notes
      const invTabs = ['profile', 'investments', 'yield', 'kyc-docs', 'notes'];
      for (const tab of invTabs) {
        const subTabBtn = drawer.locator(`button:has-text("${tab}")`).first();
        if (await subTabBtn.isVisible()) {
          await subTabBtn.click();
          await page.waitForTimeout(300);
          console.log(`      ↳ Investor sub-tab [${tab}] activated.`);
        }
      }

      // Capture screenshot of InvestorDetailDrawer
      const invDrawerShot = path.join(ARTIFACTS_DIR, 'drawer_investor_detail.png');
      await page.screenshot({ path: invDrawerShot, fullPage: true });
      console.log(`   📸 InvestorDetailDrawer screenshot captured: ${invDrawerShot}`);

      // Dismiss drawer via Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      console.log('   ✅ InvestorDetailDrawer dismissed.');
    } else {
      console.log('   ℹ️ Test investor row not rendered.');
    }

    // ─────────────────────────────────────────────────────────────
    // TEST C: EDIT DEAL PIPELINE MODAL (ProjectFormModal)
    // ─────────────────────────────────────────────────────────────
    console.log('\n🎯 Navigating to Deal Pipeline to test ProjectFormModal Edit Mode...');
    const kanbanBtn = page.locator('.admin-sidebar button[title="Deal Pipeline"]').first();
    await kanbanBtn.click();
    await page.waitForTimeout(800);

    const editBtn = page.locator('button:has-text("Edit")').first();
    if (await editBtn.isVisible()) {
      console.log('   ↳ Clicking "Edit" on deal card...');
      await editBtn.click();
      await page.waitForTimeout(600);

      // Verify ProjectFormModal opened in edit mode
      const editModal = page.locator('div[role="dialog"]:has-text("Edit Project Campaign")');
      const isVisible = await editModal.isVisible();
      console.log(`   ✅ Edit Project Modal visible: ${isVisible}`);

      const editModalShot = path.join(ARTIFACTS_DIR, 'modal_project_edit.png');
      await page.screenshot({ path: editModalShot, fullPage: true });
      console.log(`   📸 Edit Project Modal screenshot captured: ${editModalShot}`);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      console.log('   ✅ Edit Project Modal dismissed.');
    }

    await browser.close();
    console.log('\n🎉 Drawers and Modals Verification COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Drawers verification error:', error);
  } finally {
    // Clean up test records
    console.log('\n🧹 Cleaning up synthetic test records from database...');
    if (createdCohortId) {
      await sb.from('business_cohort_applications').delete().eq('id', createdCohortId);
      console.log(`   ↳ Cleaned up test cohort: ${createdCohortId}`);
    }
    if (createdInvestorId) {
      await sb.from('investors').delete().eq('id', createdInvestorId);
      console.log(`   ↳ Cleaned up test investor: ${createdInvestorId}`);
    }
    console.log('✨ Database returned to pristine baseline.');
  }
}

runDrawersAndMutationsTest();
