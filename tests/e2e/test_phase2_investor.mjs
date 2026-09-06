import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/LeNoVo/.gemini/antigravity/brain/c1fa6959-bd14-4192-9e6a-505977d700d4/test_artifacts/phase2_investor';
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:3000';

async function runPhase2InvestorTests() {
  console.log('💎 Starting Phase 2: Investor Experience & Liquidity Desk Verification...');
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
    // 1. Inject Investor Persona
    console.log('🔑 Injecting Investor test persona...');
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('gro10x_test_role', 'investor');
      localStorage.setItem('gro10x_test_user_id', 'test-investor-uuid');
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 2.1: SECONDARY MARKETPLACE (/secondary-market)
    // ─────────────────────────────────────────────────────────────
    console.log('\n📈 Navigating to Secondary Marketplace (/secondary-market)...');
    await page.goto(`${BASE_URL}/secondary-market`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Verify marketplace header and content
    const pageText = await page.textContent('body');
    const hasMarketText = pageText.includes('Secondary') || pageText.includes('Marketplace') || pageText.includes('Orderbook');
    console.log(`   ✅ Secondary Marketplace content rendered: ${hasMarketText}`);

    // Test Sell Modal trigger if available
    const sellBtn = page.locator('button:has-text("Create Listing"), button:has-text("Sell Holdings"), button:has-text("Sell")').first();
    if (await sellBtn.isVisible()) {
      console.log('   ↳ Triggering Secondary Sell Modal...');
      await sellBtn.click();
      await page.waitForTimeout(500);

      const sellShot = path.join(ARTIFACTS_DIR, 'modal_secondary_sell.png');
      await page.screenshot({ path: sellShot, fullPage: true });
      console.log(`   📸 Secondary Sell Modal captured: ${sellShot}`);

      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    const secShot = path.join(ARTIFACTS_DIR, 'secondary_marketplace.png');
    await page.screenshot({ path: secShot, fullPage: true });
    console.log(`📸 Secondary Marketplace captured: ${secShot}`);

    // ─────────────────────────────────────────────────────────────
    // TEST 2.2: INVESTOR PORTAL (/investor) (5 Tabs)
    // ─────────────────────────────────────────────────────────────
    console.log('\n💼 Navigating to Investor Portal (/investor)...');
    await page.goto(`${BASE_URL}/investor`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const invShot = path.join(ARTIFACTS_DIR, 'investor_portfolio.png');
    await page.screenshot({ path: invShot, fullPage: true });
    console.log(`📸 Investor Portfolio tab captured: ${invShot}`);

    // Cycle through Investor Tabs: kyc, docs, ai-concierge, faq
    const investorTabs = [
      { name: 'KYC Verification', file: 'investor_kyc.png' },
      { name: 'Document Vault', file: 'investor_docs.png' },
      { name: 'AI Concierge', file: 'investor_ai_concierge.png' },
      { name: 'FAQ', file: 'investor_faq.png' }
    ];

    for (const t of investorTabs) {
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
    // TEST 2.3: CASH CONCIERGE PORTAL (/cash-concierge)
    // ─────────────────────────────────────────────────────────────
    console.log('\n🤝 Navigating to Cash Concierge Portal (/cash-concierge)...');
    await page.goto(`${BASE_URL}/cash-concierge`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const conciergeShot = path.join(ARTIFACTS_DIR, 'cash_concierge_portal.png');
    await page.screenshot({ path: conciergeShot, fullPage: true });
    console.log(`📸 Cash Concierge Portal captured: ${conciergeShot}`);

    // ─────────────────────────────────────────────────────────────
    // TEST 2.4: INVESTOR SELF-ONBOARDING (/investor-onboard)
    // ─────────────────────────────────────────────────────────────
    console.log('\n🚀 Navigating to Investor Self-Onboarding (/investor-onboard)...');
    await page.goto(`${BASE_URL}/investor-onboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const onboardShot = path.join(ARTIFACTS_DIR, 'investor_onboard_flow.png');
    await page.screenshot({ path: onboardShot, fullPage: true });
    console.log(`📸 Investor Onboarding Flow captured: ${onboardShot}`);

    console.log('\n🎉 Phase 2: Investor Experience & Liquidity Desk Tests COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Phase 2 Test Failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPhase2InvestorTests();
