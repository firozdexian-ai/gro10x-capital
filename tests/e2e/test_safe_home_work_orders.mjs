import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACTS_DIR = 'C:/Users/LeNoVo/.gemini/antigravity/brain/c1fa6959-bd14-4192-9e6a-505977d700d4/test_artifacts/safe_home';
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:3000';

async function runSafeHomeTests() {
  console.log('🚀 [E2E] Starting Safe Home Fund & Work-Order Financing Verification...');
  const browser = await chromium.launch({ headless: true });
  
  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // ──────────────────────────────────────────────────────────────────────────
    // SUITE 1: Mobile-Optimized Zero-Login Terminal (/track/maats-cottage)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n📱 [SUITE 1] Testing Mobile Zero-Login Tracker (/track/maats-cottage)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 }, // iPhone 14 / Mobile screen
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto(`${BASE_URL}/track/maats-cottage`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1000);

    // 1.1 Verify Zero-Login & Core Company Profile
    const pageText = await mobilePage.content();
    assert(pageText.includes('Maats Cottage Ltd'), 'Terminal loads with Maats Cottage Ltd title');
    assert(pageText.includes('Aysha Siddika'), 'Terminal displays MD Aysha Siddika');
    assert(pageText.includes('01784397960') || pageText.includes('Faiz Ahmed'), 'Terminal displays Faiz Ahmed partner information');
    assert(pageText.includes('2621519538001'), 'Terminal displays settlement bank account 2621519538001');

    // 1.2 Verify Critical Due Alert Banner (MSP-001 Delta Life Closing Today)
    assert(pageText.includes('MSP-001') && pageText.includes('CLOSING TODAY'), 'Critical maturity alert for MSP-001 closing today is present');

    // Screenshot Mobile Hero
    await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, '01_terminal_mobile_hero.png'), fullPage: false });
    console.log('  📸 Captured 01_terminal_mobile_hero.png');

    // 1.3 Verify Active Deployments Tab (MSP-001 through MSP-006, MSP-009)
    assert(pageText.includes('MSP-001'), 'Active order MSP-001 is displayed');
    assert(pageText.includes('MSP-002'), 'Active order MSP-002 is displayed');
    assert(pageText.includes('MSP-003'), 'Active order MSP-003 is displayed');
    assert(pageText.includes('MSP-004'), 'Active order MSP-004 is displayed');
    assert(pageText.includes('MSP-005'), 'Active order MSP-005 is displayed');
    assert(pageText.includes('MSP-006'), 'Active order MSP-006 is displayed');
    assert(pageText.includes('MSP-009'), 'Active order MSP-009 is displayed');
    assert(pageText.includes('Travel Kit Bag') || pageText.includes('Greenfield Jutex'), 'MSP-003 Greenfield Jutex Travel Kit Bag is displayed');
    assert(pageText.includes('Leather Key Ring'), 'MSP-004 Delta Limited Leather Key Ring is displayed');
    assert(pageText.includes('Combined') || pageText.includes('3.75L') || pageText.includes('5.15L'), 'Combined single transfer badge is displayed');
    await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, '02_terminal_active_orders.png'), fullPage: true });
    console.log('  📸 Captured 02_terminal_active_orders.png');

    // 1.4 Test Multi-Document Inspector Modal
    const auditDocsBtn = await mobilePage.locator('button:has-text("Audit Docs & PO")').first();
    assert(await auditDocsBtn.isVisible(), 'Audit Docs & PO button is visible on active orders');
    await auditDocsBtn.click();
    await mobilePage.waitForTimeout(600);
    assert(await mobilePage.locator('span:has-text("Document Audit Package")').isVisible(), 'Multi-document inspector opened');
    
    // Switch between document tabs inside inspector
    const tranche2Tab = await mobilePage.locator('button:has-text("Tranche 2")').first();
    if (await tranche2Tab.isVisible()) {
      await tranche2Tab.click();
      await mobilePage.waitForTimeout(400);
      assert(await mobilePage.locator('img[alt*="Tranche"]').isVisible(), 'Switched to Tranche 2 disbursement slip');
    }
    await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, '03_terminal_audit_docs_modal.png') });
    console.log('  📸 Captured 03_terminal_audit_docs_modal.png');
    
    // Close inspector
    await mobilePage.locator('button:has-text("Close Audit Package")').first().click();
    await mobilePage.waitForTimeout(400);

    // 1.5 Test Dual-Document Settlement Modal on MSP-001
    const settleBtn = await mobilePage.locator('button:has-text("Settle & Close")').first();
    assert(await settleBtn.isVisible(), 'Settle & Close button is visible on active orders');
    await settleBtn.click();
    await mobilePage.waitForTimeout(600);
    assert(await mobilePage.locator('span:has-text("Dual-Document Settlement")').isVisible(), 'Dual-Document settlement modal opened');
    
    // Attach repayment slip and delivery challan via quick buttons
    await mobilePage.click('button:has-text("Quick Attach Verified CityTouch Slip")');
    await mobilePage.click('button:has-text("Quick Attach Verified Delivery Challan")');
    await mobilePage.fill('input[placeholder*="Full repayment received"]', 'EFT return received in Safe Home account; challan #DL-1013 verified at Mohakhali.');
    await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, '03b_terminal_dual_settlement_modal.png') });
    console.log('  📸 Captured 03b_terminal_dual_settlement_modal.png');

    // Confirm settlement
    await mobilePage.click('button:has-text("Confirm Settlement & Notify Telegram")');
    await mobilePage.waitForTimeout(1000);

    // 1.6 Verify Settled Orders Tab
    await mobilePage.click('button:has-text("Settled Orders")');
    await mobilePage.waitForTimeout(600);
    const settledContent = await mobilePage.content();
    assert((settledContent.includes('Settled & Repaid') || settledContent.includes('Settled &amp; Repaid')) && settledContent.includes('MSP-001'), 'MSP-001 moved to Settled Orders tab after dual verification');
    await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, '03c_terminal_settled_orders_tab.png') });
    console.log('  📸 Captured 03c_terminal_settled_orders_tab.png');

    // 1.7 Test Standalone Form Link (/track/maats-cottage/new)
    console.log('\n📄 [SUITE 1.7] Testing Standalone Work Order Creation Link (/track/maats-cottage/new)...');
    await mobilePage.goto(`${BASE_URL}/track/maats-cottage/new`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(800);
    const newPageContent = await mobilePage.content();
    assert(newPageContent.includes('Submit New Corporate Work Order') || newPageContent.includes('Raise Work Order') || newPageContent.includes('Work Order Request'), 'Standalone page renders request header');
    assert(newPageContent.includes('Corporate Buyer / Institutional Client') || newPageContent.includes('Corporate Buyer / Client Name'), 'Standalone page renders corporate client input');
    assert(newPageContent.includes('Delta Warehouse, Mohakhali, Dhaka'), 'Default Mohakhali delivery address present');

    // Fill standalone form
    await mobilePage.fill('input[placeholder*="Delta Limited"]', 'Aarong Corporate Gifts');
    await mobilePage.fill('textarea[placeholder*="Jute Laptop Bags"]', 'Branded Jute Laptop Sleeves (500 pcs)');
    await mobilePage.fill('input[placeholder="e.g. 375000"]', '200000');
    await mobilePage.fill('input[placeholder="e.g. 430000"]', '230000');
    await mobilePage.waitForTimeout(300);

    // Verify live profit and yield calculation
    const calcContent = await mobilePage.content();
    assert(calcContent.includes('30') && calcContent.includes('15.00%'), 'Live calculator computes +৳30k gross profit and 15.00% yield');

    await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, '04_standalone_work_order_form.png'), fullPage: true });
    console.log('  📸 Captured 04_standalone_work_order_form.png');

    // Navigate back to tracker
    await mobilePage.goto(`${BASE_URL}/track/maats-cottage`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(600);

    // 1.8 Switch to Pending Approvals Tab
    await mobilePage.click('button:has-text("Pending Approvals")');
    await mobilePage.waitForTimeout(600);
    const pendingText = await mobilePage.content();
    assert(pendingText.includes('MSP-007'), 'Pending order MSP-007 is present');
    assert(pendingText.includes('MSP-008'), 'Pending order MSP-008 is present');
    await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, '04b_terminal_pending_approvals.png') });
    console.log('  📸 Captured 04b_terminal_pending_approvals.png');

    // 1.9 Switch to Profile & Compliance Tab
    await mobilePage.click('button:has-text("Profile & Compliance")');
    await mobilePage.waitForTimeout(600);
    const complianceText = await mobilePage.content();
    assert(complianceText.includes('Trade License'), 'Trade License item present in checklist');
    assert(complianceText.includes('e-TIN Certificate'), 'e-TIN item present in checklist');
    assert(complianceText.includes('BIN / VAT'), 'BIN/VAT item present in checklist');
    assert(complianceText.includes('Director NID'), 'Director NID & CIB clearance verified');
    assert(complianceText.includes('Security Cheque'), 'Security cheque verified');
    assert(complianceText.includes('Company Profile Deck'), 'Company Profile Deck download link present');
    assert(complianceText.includes('Product Showroom'), 'Product Showroom & Gallery present');
    await mobilePage.screenshot({ path: path.join(ARTIFACTS_DIR, '05_terminal_compliance_checklist.png') });
    console.log('  📸 Captured 05_terminal_compliance_checklist.png');

    await mobileContext.close();

    // ──────────────────────────────────────────────────────────────────────────
    // SUITE 2: Desktop Terminal & Interactive Actions
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n💻 [SUITE 2] Testing Desktop Terminal & Actions (/track/maats-cottage)...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(`${BASE_URL}/track/maats-cottage`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(800);

    // 2.1 Test Copy WhatsApp Button
    await desktopPage.click('button:has-text("Copy WhatsApp Update")');
    await desktopPage.waitForTimeout(500);
    const copyButtonText = await desktopPage.locator('button:has-text("Copied")').textContent();
    assert(copyButtonText.includes('Copied'), 'Copy WhatsApp button changes state on click');

    // 2.2 Test Log Work Order Modal
    await desktopPage.click('button:has-text("Log Work Order")');
    await desktopPage.waitForTimeout(500);
    assert(await desktopPage.locator('h3, span:has-text("Log New Work Order")').first().isVisible(), 'Log Work Order modal opened');
    
    // Fill and submit test order
    await desktopPage.fill('input[placeholder*="Auto-generated"]', 'MSP-TEST');
    await desktopPage.fill('input[placeholder*="Delta Life Insurance, Unique Group"]', 'Apex Footwear Ltd');
    await desktopPage.fill('input[placeholder*="Jute shopping bags"]', 'Promotional Canvas Duffel Bags');
    await desktopPage.fill('input[placeholder="e.g. 250000"]', '180000');
    await desktopPage.fill('input[placeholder="e.g. 287500"]', '210000');
    await desktopPage.click('button:has-text("Submit Order")');
    await desktopPage.waitForTimeout(800);

    // Verify toast
    const toastText = await desktopPage.content();
    assert(toastText.includes('MSP-TEST') || toastText.includes('logged'), 'New order MSP-TEST logged successfully');

    // 2.3 Verify Pending Order shows read-only approval status and NO approve button
    await desktopPage.click('button:has-text("Pending Approvals")');
    await desktopPage.waitForTimeout(500);
    const pendingStatusBadge = await desktopPage.locator('text=Awaiting Partner Sign-off').first();
    assert(await pendingStatusBadge.isVisible(), 'Pending orders show read-only Awaiting Partner Sign-off badge');
    
    // Ensure Approve & Disburse button is NOT present in the public display tracker
    const publicApproveBtn = await desktopPage.locator('button:has-text("Approve & Disburse")').first();
    assert(!(await publicApproveBtn.isVisible()), 'Approve & Disburse button is hidden from public display page');

    await desktopContext.close();

    // ──────────────────────────────────────────────────────────────────────────
    // SUITE 3: Institutional Work-Order Financing Desk (/admin)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n🏛️ [SUITE 3] Testing Institutional Work-Order Financing Desk (/admin)...');
    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const adminPage = await adminContext.newPage();

    // Authenticate via test role injection
    await adminPage.goto(BASE_URL);
    await adminPage.evaluate(() => {
      localStorage.setItem('gro10x_test_role', 'admin');
      localStorage.setItem('gro10x_test_user_id', 'test-admin-uuid');
    });
    await adminPage.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(1200);

    // Check sidebar contains Work-Order Desk
    const sidebarWorkOrderBtn = await adminPage.locator('button[title*="Work-Order"], button:has-text("Work-Order Desk")').first();
    assert(await sidebarWorkOrderBtn.isVisible(), 'Sidebar contains Work-Order Desk button under Deal Operations');

    // Navigate to Work-Order Desk Tab
    await sidebarWorkOrderBtn.click();
    await adminPage.waitForTimeout(1000);

    const adminContent = await adminPage.content();
    assert(adminContent.includes('Corporate Work-Order Financing Desk'), 'Admin desk header is rendered');
    assert(adminContent.includes('SAFE HOME WEALTH MANAGEMENT FUND'), 'Safe Home Wealth Management Fund banner is displayed');
    assert(adminContent.includes('Faiz Ahmed'), 'Faiz Ahmed Managing Partner co-sign is present');
    assert(adminContent.includes('Facility Utilization'), 'Maats Cottage facility utilization widget is rendered');

    // Verify table lists work orders
    assert(adminContent.includes('MSP-001'), 'MSP-001 is listed in the admin table');
    assert(adminContent.includes('Delta Limited') || adminContent.includes('Delta Life Insurance') || adminContent.includes('Delta'), 'Corporate client Delta is listed in table');
    assert(adminContent.includes('Greenfield Jutex') || adminContent.includes('Greenfield'), 'Greenfield Jutex is listed in table');

    // Test filter buttons
    await adminPage.click('button:has-text("Pending Approval")');
    await adminPage.waitForTimeout(400);
    assert(await adminPage.locator('td:has-text("Pending Approval")').first().isVisible(), 'Filtered to pending approval orders');

    await adminPage.click('button:has-text("All Orders")');
    await adminPage.waitForTimeout(400);

    await adminPage.screenshot({ path: path.join(ARTIFACTS_DIR, '06_admin_work_orders_desk.png') });
    console.log('  📸 Captured 06_admin_work_orders_desk.png');

    await adminContext.close();

    // ──────────────────────────────────────────────────────────────────────────
    // SUITE 4: Public Showcase Deal Verification (/showcase)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n🌟 [SUITE 4] Testing Public Showcase Deals (/showcase)...');
    const showcaseContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const showcasePage = await showcaseContext.newPage();

    await showcasePage.goto(`${BASE_URL}/showcase`, { waitUntil: 'networkidle' });
    await showcasePage.waitForTimeout(1000);

    const showcaseContent = await showcasePage.content();
    assert(showcaseContent.includes('Oro Roasters — Mirpur Hub'), 'Oro Mirpur deal is displayed');
    assert(showcaseContent.includes('Oro Roasters — Banani Hub'), 'Oro Banani deal is displayed');
    assert(showcaseContent.includes('Safe Home Wealth Management Fund') || showcaseContent.includes('Safe Home'), 'Safe Home Wealth Management Fund deal is displayed');

    // Filter by Wealth Management
    const wmBtn = await showcasePage.locator('button:has-text("Wealth Management")').first();
    if (await wmBtn.isVisible()) {
      await wmBtn.click();
      await showcasePage.waitForTimeout(600);
      const filteredShowcase = await showcasePage.content();
      assert(filteredShowcase.includes('Safe Home Wealth Management Fund'), 'Wealth Management category filter shows Safe Home Fund');
    }

    await showcasePage.screenshot({ path: path.join(ARTIFACTS_DIR, '07_showcase_safe_home_fund.png') });
    console.log('  📸 Captured 07_showcase_safe_home_fund.png');

    // Test View Deal Room for Safe Home Wealth Management Fund
    await showcasePage.goto(`${BASE_URL}/projects/c3a2b3c4-d5e6-7890-abcd-ef1234567890`, { waitUntil: 'networkidle' });
    await showcasePage.waitForTimeout(1200);

    const dealRoomContent = await showcasePage.content();
    assert(dealRoomContent.includes('Safe Home Wealth Management Fund'), 'Deal room displays Safe Home Wealth Management Fund title');
    assert(!dealRoomContent.includes('National Grid'), 'Deal room does NOT display National Grid');
    assert(dealRoomContent.includes('Safe Home SPV-01') || dealRoomContent.includes('Safe Home Wealth Management SPV-01'), 'Deal room displays Safe Home SPV');
    assert(!dealRoomContent.includes('Open Live Work-Order Tracker'), 'Open Live Work-Order Tracker is removed from public deal room');
    assert(dealRoomContent.includes('Active Portfolio Deployments'), 'Deal room displays Portfolio Deployments section');
    assert(dealRoomContent.includes('Maats Cottage Ltd'), 'Deal room displays Maats Cottage in portfolio deployments');
    assert(dealRoomContent.includes('Monthly Return'), 'Deal room displays Monthly Return (Option 1)');
    assert(dealRoomContent.includes('Semi-Annual'), 'Deal room displays Semi-Annual (Option 2)');
    assert(dealRoomContent.includes('Annual Return'), 'Deal room displays Annual Return (Option 3)');
    assert(dealRoomContent.includes('Frequently Asked Investor Questions'), 'Deal room displays FAQ Accordion');

    await showcasePage.screenshot({ path: path.join(ARTIFACTS_DIR, '08_deal_room_safe_home_fund.png') });
    console.log('  📸 Captured 08_deal_room_safe_home_fund.png');

    await showcaseContext.close();

  } finally {
    await browser.close();
  }

  console.log(`\n🎉 [ALL TESTS PASSED] ${passedTests}/${totalTests} tests successful! 0 regressions.\n`);
}

runSafeHomeTests().catch(err => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
