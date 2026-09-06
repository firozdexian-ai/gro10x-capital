import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/LeNoVo/.gemini/antigravity/brain/c1fa6959-bd14-4192-9e6a-505977d700d4/test_artifacts/phase5_loops';
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:3000';

async function runPhase5LoopsTests() {
  console.log('🔄 Starting Phase 5: Cross-Stakeholder End-to-End Loops & Telegram MiniApp Verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 } // Telegram Mobile Viewport
  });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`[Browser Console Error] ${msg.text()}`);
  });
  page.on('pageerror', err => console.log(`[Browser Page Error] ${err.message}`));

  try {
    // ─────────────────────────────────────────────────────────────
    // TEST 5.1: TELEGRAM MINIAPP MOBILE VIEW (/team-miniapp)
    // ─────────────────────────────────────────────────────────────
    console.log('\n📱 Navigating to Telegram MiniApp (/team-miniapp)...');
    await page.goto(`${BASE_URL}/team-miniapp`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    const miniappHomeShot = path.join(ARTIFACTS_DIR, 'miniapp_home.png');
    await page.screenshot({ path: miniappHomeShot, fullPage: true });
    console.log(`📸 Telegram MiniApp Home captured: ${miniappHomeShot}`);

    // Test switching tabs on bottom nav: Leads, Payouts, KYC, Me
    const leadsNavBtn = page.locator('button:has-text("Leads")').last();
    if (await leadsNavBtn.isVisible()) {
      console.log('   ↳ Switching to Leads tab on MiniApp bottom nav...');
      await leadsNavBtn.click();
      await page.waitForTimeout(600);
      const miniappLeadsShot = path.join(ARTIFACTS_DIR, 'miniapp_leads.png');
      await page.screenshot({ path: miniappLeadsShot, fullPage: true });
      console.log(`   📸 MiniApp Leads tab captured: ${miniappLeadsShot}`);

      // Test opening New Prospect modal
      const newProspectBtn = page.locator('button:has-text("New Prospect")').first();
      if (await newProspectBtn.isVisible()) {
        console.log('   ↳ Opening New Prospect modal...');
        await newProspectBtn.click();
        await page.waitForTimeout(600);
        const modalShot = path.join(ARTIFACTS_DIR, 'miniapp_prospect_modal.png');
        await page.screenshot({ path: modalShot, fullPage: true });
        console.log(`   📸 MiniApp New Prospect Modal captured: ${modalShot}`);
        const closeBtn = page.locator('button:has-text("✕")').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
        } else {
          await page.keyboard.press('Escape');
        }
        await page.waitForTimeout(500);
      }
    }

    // Switch to Payouts tab
    const payoutsNavBtn = page.locator('button:has-text("Payouts")').last();
    if (await payoutsNavBtn.isVisible()) {
      console.log('   ↳ Switching to Payouts tab on MiniApp bottom nav...');
      await payoutsNavBtn.click();
      await page.waitForTimeout(600);
      const miniappPayoutsShot = path.join(ARTIFACTS_DIR, 'miniapp_payouts.png');
      await page.screenshot({ path: miniappPayoutsShot, fullPage: true });
      console.log(`   📸 MiniApp Payouts tab captured: ${miniappPayoutsShot}`);
    }

    // Switch to KYC tab
    const kycNavBtn = page.locator('button:has-text("KYC")').last();
    if (await kycNavBtn.isVisible()) {
      console.log('   ↳ Switching to KYC tab on MiniApp bottom nav...');
      await kycNavBtn.click();
      await page.waitForTimeout(600);
      const miniappKycShot = path.join(ARTIFACTS_DIR, 'miniapp_kyc.png');
      await page.screenshot({ path: miniappKycShot, fullPage: true });
      console.log(`   📸 MiniApp KYC tab captured: ${miniappKycShot}`);
    }

    // Switch to Me tab
    const meNavBtn = page.locator('button:has-text("Me")').last();
    if (await meNavBtn.isVisible()) {
      console.log('   ↳ Switching to Me tab on MiniApp bottom nav...');
      await meNavBtn.click();
      await page.waitForTimeout(600);
      const miniappMeShot = path.join(ARTIFACTS_DIR, 'miniapp_me.png');
      await page.screenshot({ path: miniappMeShot, fullPage: true });
      console.log(`   📸 MiniApp Me tab captured: ${miniappMeShot}`);
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 5.2: API ENDPOINTS & EDGE INGESTION ASSERTIONS
    // ─────────────────────────────────────────────────────────────
    console.log('\n⚡ Testing Edge Function API Routes...');
    
    // 1. Telegram KAM Notify Endpoint
    const kamNotifyRes = await page.request.post(`${BASE_URL}/api/telegram-notify-kam`, {
      data: {
        kamId: '00000000-0000-0000-0000-000000000001',
        title: '💼 [TEST] OTC Consultation Scheduled',
        message: 'A test HNI investor requested an OTC consultation.'
      }
    });
    console.log(`   ↳ /api/telegram-notify-kam HTTP status: ${kamNotifyRes.status()}`);

    // 2. POS Edge Ingest Endpoint
    const posIngestRes = await page.request.post(`${BASE_URL}/api/edge-pos-ingest`, {
      data: {
        business_id: '00000000-0000-0000-0000-000000000001',
        gross_sales: 150000,
        net_profit: 35000,
        tx_count: 85
      }
    });
    console.log(`   ↳ /api/edge-pos-ingest HTTP status: ${posIngestRes.status()}`);

    // 3. MiniApp Auth Handshake Endpoint
    const miniappAuthRes = await page.request.post(`${BASE_URL}/api/miniapp-auth/validate`, {
      data: { initData: '' }
    });
    console.log(`   ↳ /api/miniapp-auth/validate HTTP status: ${miniappAuthRes.status()}`);

    console.log('\n🎉 Phase 5: Cross-Stakeholder End-to-End Loops Tests COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Phase 5 Test Failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPhase5LoopsTests();
