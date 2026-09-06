import { execSync } from 'child_process';
import path from 'path';

const suites = [
  { name: 'Phase 1: Admin Command Center (15 Tabs & Viewports)', script: 'tests/e2e/test_master_admin_tabs.mjs' },
  { name: 'Sub-Phase 1.5: Modals, Drawers & DB Mutations', script: 'tests/e2e/test_drawers_and_mutations.mjs' },
  { name: 'Phase 2: Investor Experience & Liquidity Desk', script: 'tests/e2e/test_phase2_investor.mjs' },
  { name: 'Phase 3: SME Founder Portal & Cohort Funnel', script: 'tests/e2e/test_phase3_founder.mjs' },
  { name: 'Phase 4: Field Operations Desks (KAM & Promoter)', script: 'tests/e2e/test_phase4_field.mjs' },
  { name: 'Phase 5: Cross-Stakeholder Loops & Telegram MiniApp', script: 'tests/e2e/test_phase5_loops.mjs' },
  { name: 'Phase 6: Safe Home Fund & Work-Order Financing', script: 'tests/e2e/test_safe_home_work_orders.mjs' }
];

console.log('===============================================================');
console.log('🚀 GRO10X CAPITAL — MASTER END-TO-END BROWSER TEST SUITE');
console.log('===============================================================\n');

let passed = 0;
let failed = 0;
const results = [];

for (const suite of suites) {
  console.log(`\n▶️ Executing [${suite.name}]...`);
  const startTime = Date.now();
  try {
    execSync(`node "${suite.script}"`, { stdio: 'inherit' });
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ [${suite.name}] PASSED (${duration}s)`);
    results.push({ name: suite.name, status: 'PASSED', duration: `${duration}s` });
    passed++;
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`❌ [${suite.name}] FAILED (${duration}s)`);
    results.push({ name: suite.name, status: 'FAILED', duration: `${duration}s` });
    failed++;
  }
}

console.log('\n===============================================================');
console.log('📊 MASTER TEST EXECUTION SUMMARY:');
console.log('===============================================================');
for (const res of results) {
  const icon = res.status === 'PASSED' ? '✅' : '❌';
  console.log(`${icon} ${res.name.padEnd(52)} ${res.status.padEnd(8)} (${res.duration})`);
}
console.log('===============================================================');
console.log(`Total Suites: ${suites.length} | Passed: ${passed} | Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL MASTER E2E TESTS PASSED WITH ZERO REGRESSIONS!');
  process.exit(0);
}
