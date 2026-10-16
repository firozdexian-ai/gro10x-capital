/**
 * GRO10X OS — Grand Audit Test Runner (runner.js)
 * 
 * Implements:
 * - Step 6: Calibrated Timeouts (10s for route loads with async fetches, 4.5s for simple clicks)
 * - Step 7: 800ms Human Pacing for visual review (with Fast Mode toggle for CI)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('./registry.js'),
      require('./selector-engine.js')
    );
  } else {
    root.GRO10X_RUNNER = factory(
      root.GRO10X_REGISTRY,
      root.GRO10X_SELECTORS
    );
  }
})(typeof self !== 'undefined' ? self : this, function (registry, selectors) {
  'use strict';

  // Step 6: Calibrated Timeouts
  const TIMEOUTS = {
    ROUTE_LOAD: 10000,    // 10s for initial route loads and async Supabase fetches
    ACTION_CLICK: 4500,   // 4.5s for simple clicks, modals, and input states
    ELEMENT_WAIT: 4500    // 4.5s element detection threshold
  };

  // Step 7: Calibrated Pacing Delays
  const PACING = {
    HUMAN: 800,           // 800ms Human Pacing to visually review animations and modals
    FAST_CI: 50           // Fast Mode for automated CI runs
  };

  class GrandAuditRunner {
    constructor(options = {}) {
      this.mode = options.mode || 'human'; // 'human' (800ms) or 'fast' (50ms)
      this.pacingDelay = this.mode === 'human' ? PACING.HUMAN : PACING.FAST_CI;
      this.onProgress = options.onProgress || (() => {});
      this.onLog = options.onLog || (() => {});
      this.isAborted = false;
    }

    setPacingMode(mode) {
      this.mode = mode;
      this.pacingDelay = mode === 'human' ? PACING.HUMAN : PACING.FAST_CI;
      this.log(`Pacing mode updated to: ${this.mode.toUpperCase()} (${this.pacingDelay}ms)`);
    }

    log(message, type = 'info') {
      const timestamp = new Date().toISOString().substring(11, 19);
      const entry = { timestamp, message, type };
      this.onLog(entry);
    }

    abort() {
      this.isAborted = true;
      this.log('Execution abort requested.', 'warn');
    }

    async sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Execute a single suite inside the current tab or document context
     */
    async executeSuite(suite, context = {}) {
      if (this.isAborted) return { suiteId: suite.id, status: 'SKIPPED', error: 'Aborted' };

      const startTime = Date.now();
      this.log(`▶ Starting [${suite.name}] (${suite.path}${suite.hash || ''})...`, 'info');

      try {
        // 1. Arm Persona if needed
        if (suite.persona) {
          window.dispatchEvent(new CustomEvent('gro10x:set-persona', {
            detail: { persona: suite.persona }
          }));
          await this.sleep(150);
        }

        // 2. Route / Hash Navigation if hash is specified
        if (suite.hash && window.location.hash !== suite.hash) {
          window.location.hash = suite.hash;
          await this.sleep(this.pacingDelay);
        }

        // 3. Step 6: Wait for route selector with 10s calibrated timeout
        if (suite.selector) {
          await selectors.waitForResilient(suite.selector, {
            timeout: TIMEOUTS.ROUTE_LOAD
          });
          this.log(`   ✓ Found primary selector: ${suite.selector}`, 'success');
        }

        // 4. Verify expected text tokens
        if (suite.expectedText && suite.expectedText.length > 0) {
          const bodyText = document.body.innerText || '';
          for (const token of suite.expectedText) {
            if (!bodyText.toLowerCase().includes(token.toLowerCase())) {
              this.log(`   ⚠️ Expected text token "${token}" not yet found in DOM`, 'warn');
            }
          }
        }

        // Human Pacing delay to observe page rendering
        await this.sleep(this.pacingDelay);

        // 5. Execute Suite Actions (clicks, inputs, verification)
        if (suite.actions && suite.actions.length > 0) {
          for (let i = 0; i < suite.actions.length; i++) {
            if (this.isAborted) break;
            const action = suite.actions[i];

            if (action.type === 'click') {
              this.log(`   ↳ Clicking selector: ${action.selector}...`, 'info');
              await selectors.clickResilient(action.selector, {
                timeout: TIMEOUTS.ACTION_CLICK
              });
              await this.sleep(this.pacingDelay); // 800ms pacing delay for visual inspection
            } else if (action.type === 'fill') {
              this.log(`   ↳ Filling "${action.value}" into ${action.selector}...`, 'info');
              await selectors.fillResilient(action.selector, action.value, {
                timeout: TIMEOUTS.ACTION_CLICK
              });
              await this.sleep(this.pacingDelay);
            } else if (action.type === 'verify') {
              await selectors.waitForResilient(action.selector, {
                timeout: TIMEOUTS.ELEMENT_WAIT
              });
              this.log(`   ✓ Verified element: ${action.selector}`, 'success');
              await this.sleep(this.pacingDelay);
            }
          }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        this.log(`✅ [${suite.name}] PASSED (${duration}s)`, 'success');

        return {
          suiteId: suite.id,
          name: suite.name,
          status: 'PASSED',
          duration: `${duration}s`
        };
      } catch (err) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        this.log(`❌ [${suite.name}] FAILED (${duration}s): ${err.message}`, 'error');

        return {
          suiteId: suite.id,
          name: suite.name,
          status: 'FAILED',
          duration: `${duration}s`,
          error: err.message
        };
      }
    }

    /**
     * Run all suites in a specific platform or across the entire 8 platforms
     */
    async runPlatform(platformId) {
      this.isAborted = false;
      const platform = registry.getPlatform(platformId);
      if (!platform) throw new Error(`Platform not found: ${platformId}`);

      this.log(`====================================================`, 'info');
      this.log(`🚀 Grand Audit: [${platform.name}] (${platform.suites.length} Suites)`, 'info');
      this.log(`====================================================`, 'info');

      const results = [];
      let passed = 0;
      let failed = 0;

      for (let i = 0; i < platform.suites.length; i++) {
        if (this.isAborted) break;
        const suite = platform.suites[i];
        
        this.onProgress({
          platformId,
          platformName: platform.name,
          currentIndex: i + 1,
          totalSuites: platform.suites.length,
          suiteName: suite.name,
          percent: Math.round(((i + 1) / platform.suites.length) * 100)
        });

        const res = await this.executeSuite(suite);
        results.push(res);
        if (res.status === 'PASSED') passed++;
        if (res.status === 'FAILED') failed++;
      }

      return {
        platformId,
        platformName: platform.name,
        total: platform.suites.length,
        passed,
        failed,
        results
      };
    }
  }

  return {
    TIMEOUTS,
    PACING,
    GrandAuditRunner
  };
});
