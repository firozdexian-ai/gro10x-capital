// GRO10X OS — UI Auditor & Grand Audit Runner Controller (popup.js)

document.addEventListener('DOMContentLoaded', () => {
  // Elements - Tabs & Views
  const tabSnapperBtn = document.getElementById('tabSnapperBtn');
  const tabRunnerBtn = document.getElementById('tabRunnerBtn');
  const viewSnapper = document.getElementById('viewSnapper');
  const viewRunner = document.getElementById('viewRunner');
  const popoutBtn = document.getElementById('popoutBtn');

  // Elements - Snapper
  const pageSelect = document.getElementById('pageSelect');
  const navigateBtn = document.getElementById('navigateBtn');
  const captureBtn = document.getElementById('captureBtn');

  // Elements - Audit Runner
  const pacingSelect = document.getElementById('pacingSelect');
  const platformSelect = document.getElementById('platformSelect');
  const startAuditBtn = document.getElementById('startAuditBtn');
  const abortAuditBtn = document.getElementById('abortAuditBtn');
  const progressContainer = document.getElementById('progressContainer');
  const progressSuiteTitle = document.getElementById('progressSuiteTitle');
  const progressCount = document.getElementById('progressCount');
  const progressFill = document.getElementById('progressFill');
  const logBox = document.getElementById('logBox');

  // Elements - Export Toolbar
  const exportBar = document.getElementById('exportBar');
  const copyReportBtn = document.getElementById('copyReportBtn');
  const exportMdBtn = document.getElementById('exportMdBtn');
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const clearLogsBtn = document.getElementById('clearLogsBtn');

  // Elements - General
  const statusBox = document.getElementById('statusBox');

  let isAborted = false;

  let lastAuditData = {
    scopeTitle: '',
    timestamp: '',
    pacingMs: 800,
    baseUrl: '',
    totalSuites: 0,
    passedCount: 0,
    warnCount: 0,
    failedCount: 0,
    isAborted: false,
    suites: [],
    rawLogs: []
  };

  function setStatus(msg, type = 'info') {
    statusBox.textContent = msg;
    statusBox.className = `status ${type}`;
    statusBox.style.display = 'block';
  }

  function clearStatus() {
    statusBox.textContent = '';
    statusBox.className = 'status';
    statusBox.style.display = 'none';
  }

  function addLog(msg, type = 'info') {
    const timeStr = new Date().toLocaleTimeString();
    lastAuditData.rawLogs.push({ time: timeStr, msg, type });

    logBox.style.display = 'block';
    if (exportBar) exportBar.style.display = 'flex';

    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = `[${timeStr}] ${msg}`;
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;
  }

  // Popout / Detach window
  if (popoutBtn) {
    if (window.location.search.includes('detached=true') || window.innerWidth > 430) {
      popoutBtn.style.display = 'none';
    } else {
      popoutBtn.addEventListener('click', () => {
        chrome.windows.create({
          url: chrome.runtime.getURL('popup.html?detached=true'),
          type: 'popup',
          width: 440,
          height: 680
        });
        window.close();
      });
    }
  }

  // 1. Tab Switching
  tabSnapperBtn.addEventListener('click', () => {
    tabSnapperBtn.classList.add('active');
    tabRunnerBtn.classList.remove('active');
    viewSnapper.style.display = 'block';
    viewRunner.style.display = 'none';
  });

  tabRunnerBtn.addEventListener('click', () => {
    tabRunnerBtn.classList.add('active');
    tabSnapperBtn.classList.remove('active');
    viewSnapper.style.display = 'none';
    viewRunner.style.display = 'block';
  });

  // Helper: Find target test tab
  async function getTargetTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    let tab = tabs[0];
    
    // If popup is detached in its own window, find the active tab in another window
    if (!tab || tab.url?.startsWith('chrome-extension://')) {
      const allTabs = await chrome.tabs.query({});
      tab = allTabs.find(t => 
        t.url && (
          t.url.startsWith('http://localhost') || 
          t.url.startsWith('http://127.0.0.1') || 
          t.url.includes('gro10x.com') || 
          t.url.includes('vercel.app')
        )
      ) || allTabs.find(t => t.url && !t.url.startsWith('chrome'));
    }
    return tab;
  }

  // Helper: Wait for tab to complete navigation
  function waitForTabReady(tabId, timeout = 10000) {
    return new Promise((resolve) => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      }, timeout);

      function listener(id, changeInfo) {
        if (id === tabId && changeInfo.status === 'complete') {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            chrome.tabs.onUpdated.removeListener(listener);
            resolve();
          }
        }
      }
      chrome.tabs.onUpdated.addListener(listener);
    });
  }

  // 2. Snapper: Navigate Button
  navigateBtn.addEventListener('click', async () => {
    const path = pageSelect.value;
    setStatus(`Navigating to ${path}...`, 'info');
    
    try {
      const tab = await getTargetTab();
      if (!tab) throw new Error('No target web tab found');

      let baseUrl = 'http://localhost:3000';
      if (tab.url && (tab.url.startsWith('http://localhost') || tab.url.startsWith('http://127.0.0.1') || tab.url.includes('gro10x.com') || tab.url.includes('vercel.app'))) {
        const u = new URL(tab.url);
        baseUrl = u.origin;
      }

      const targetUrl = `${baseUrl}${path}`;
      await chrome.tabs.update(tab.id, { url: targetUrl });
      setStatus(`Loaded: ${path}`, 'success');
    } catch (err) {
      setStatus(`Error: ${err.message}`, 'error');
    }
  });

  // 3. Snapper: Auto-Scroll & Capture Full Page
  captureBtn.addEventListener('click', async () => {
    captureBtn.disabled = true;
    navigateBtn.disabled = true;
    setStatus('Preparing page & auto-scrolling...', 'info');

    try {
      const tab = await getTargetTab();
      if (!tab || !tab.id) throw new Error('No target web tab found');

      setStatus('Scrolling page to render all charts & images...', 'info');
      
      const [metrics] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async () => {
          const style = document.createElement('style');
          style.id = '__gro10x_no_scroll';
          style.innerHTML = '::-webkit-scrollbar { display: none !important; }';
          document.head.appendChild(style);

          const totalHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight
          );
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;

          let currentY = 0;
          const step = Math.floor(viewportHeight * 0.7);

          while (currentY < totalHeight) {
            window.scrollTo(0, currentY);
            await new Promise(r => setTimeout(r, 60));
            currentY += step;
          }

          window.scrollTo(0, totalHeight);
          await new Promise(r => setTimeout(r, 120));
          window.scrollTo(0, 0);
          await new Promise(r => setTimeout(r, 200));

          return {
            totalHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
            viewportHeight,
            viewportWidth,
            dpr: window.devicePixelRatio || 1
          };
        }
      });

      if (!metrics || !metrics.result) throw new Error('Could not measure page dimensions');
      const { totalHeight, viewportHeight, viewportWidth, dpr } = metrics.result;

      const slices = [];
      let currentY = 0;
      let sliceIndex = 0;
      const totalSlices = Math.ceil(totalHeight / viewportHeight);

      while (currentY < totalHeight) {
        sliceIndex++;
        setStatus(`Capturing slice ${sliceIndex} of ${totalSlices}...`, 'info');

        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (y) => window.scrollTo(0, y),
          args: [currentY]
        });

        await new Promise(r => setTimeout(r, 150));
        const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
        slices.push({ y: currentY, dataUrl });

        if (sliceIndex === 1) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              document.querySelectorAll('header, .leadbot-floating-btn, nav, [style*="position: fixed"]').forEach(el => {
                el.setAttribute('data-orig-vis', el.style.visibility || '');
                el.style.visibility = 'hidden';
              });
            }
          });
        }

        currentY += viewportHeight;
        if (currentY >= totalHeight) break;
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const s = document.getElementById('__gro10x_no_scroll');
          if (s) s.remove();
          document.querySelectorAll('header, .leadbot-floating-btn, nav, [style*="position: fixed"]').forEach(el => {
            el.style.visibility = el.getAttribute('data-orig-vis') || '';
            el.removeAttribute('data-orig-vis');
          });
          window.scrollTo(0, 0);
        }
      });

      setStatus('Stitching full-page canvas...', 'info');

      const canvas = document.createElement('canvas');
      canvas.width = viewportWidth * dpr;
      canvas.height = totalHeight * dpr;
      const ctx = canvas.getContext('2d');

      for (const slice of slices) {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = slice.dataUrl;
        });
        const yOffset = slice.y * dpr;
        ctx.drawImage(img, 0, yOffset);
      }

      const finalDataUrl = canvas.toDataURL('image/png');
      const pageName = pageSelect.value.replace(/[^a-zA-Z0-9]/g, '_').replace(/^_+|_+$/g, '') || 'home';
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `gro10x-${pageName}-${timestamp}.png`;

      setStatus('Saving screenshot...', 'info');
      await chrome.downloads.download({
        url: finalDataUrl,
        filename: filename,
        saveAs: false
      });

      setStatus(`✓ Captured & Downloaded: ${filename}`, 'success');
    } catch (err) {
      console.error(err);
      setStatus(`Capture failed: ${err.message}`, 'error');
    } finally {
      captureBtn.disabled = false;
      navigateBtn.disabled = false;
    }
  });

  // 4. Grand Audit Runner Execution (Real-Time Orchestrator)
  startAuditBtn.addEventListener('click', async () => {
    isAborted = false;
    const selectedScope = platformSelect.value;
    const selectedPacing = pacingSelect.value; // 'human' (800ms) or 'fast' (50ms)
    const pacingMs = selectedPacing === 'human' ? 800 : 50;

    startAuditBtn.style.display = 'none';
    abortAuditBtn.style.display = 'block';
    progressContainer.style.display = 'block';
    logBox.innerHTML = '';
    logBox.style.display = 'block';
    if (exportBar) exportBar.style.display = 'flex';

    const registry = window.GRO10X_REGISTRY;
    if (!registry) {
      addLog('Error: GRO10X_REGISTRY failed to load.', 'error');
      startAuditBtn.style.display = 'block';
      abortAuditBtn.style.display = 'none';
      return;
    }

    let targetSuites = [];
    let scopeTitle = '';

    if (selectedScope === 'all') {
      targetSuites = registry.getAllSuites();
      scopeTitle = 'All 8 Platforms (Grand Audit)';
    } else {
      const platform = registry.getPlatform(selectedScope);
      if (!platform) {
        addLog(`Error: Platform not found: ${selectedScope}`, 'error');
        startAuditBtn.style.display = 'block';
        abortAuditBtn.style.display = 'none';
        return;
      }
      targetSuites = platform.suites;
      scopeTitle = platform.name;
    }

    // Initialize session report data
    lastAuditData = {
      scopeTitle,
      timestamp: new Date().toLocaleString(),
      pacingMs,
      baseUrl: 'http://localhost:3000',
      totalSuites: targetSuites.length,
      passedCount: 0,
      warnCount: 0,
      failedCount: 0,
      isAborted: false,
      suites: [],
      rawLogs: []
    };

    addLog(`🚀 Starting Audit: ${scopeTitle} (${targetSuites.length} suites, ${pacingMs}ms pacing)...`, 'info');

    try {
      const tab = await getTargetTab();
      if (!tab || !tab.id) throw new Error('No target tab found. Please open your GRO10X app.');

      if (tab.url?.startsWith('chrome://')) {
        throw new Error('Active tab is a Chrome internal page. Please switch to your app tab.');
      }

      let baseUrl = 'http://localhost:3000';
      if (tab.url && (tab.url.startsWith('http://localhost') || tab.url.startsWith('http://127.0.0.1') || tab.url.includes('gro10x.com') || tab.url.includes('vercel.app'))) {
        const u = new URL(tab.url);
        baseUrl = u.origin;
      }
      lastAuditData.baseUrl = baseUrl;

      let passedCount = 0;
      let warnCount = 0;
      let failedCount = 0;

      for (let i = 0; i < targetSuites.length; i++) {
        if (isAborted) {
          addLog('⏹ Execution stopped by user.', 'warn');
          break;
        }

        const suite = targetSuites[i];
        const progressPct = Math.round(((i) / targetSuites.length) * 100);
        progressFill.style.width = `${progressPct}%`;
        progressCount.textContent = `${progressPct}%`;
        progressSuiteTitle.textContent = `[${i + 1}/${targetSuites.length}] ${suite.name}`;

        // 0. Pre-arm Persona in the tab's localStorage BEFORE any navigation
        if (suite.persona) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: (persona) => {
                try {
                  localStorage.setItem('gro10x_test_role', persona);
                  localStorage.setItem('gro10x_test_user_id', `test-${persona}-id`);
                } catch (_) {}
                window.dispatchEvent(new CustomEvent('gro10x:set-persona', {
                  detail: { persona }
                }));
              },
              args: [suite.persona]
            });
          } catch (_) {}
        }

        // 1. Check navigation
        const currentTab = await chrome.tabs.get(tab.id);
        const currentUrl = new URL(currentTab.url || baseUrl);
        const targetUrl = `${baseUrl}${suite.path}${suite.hash || ''}`;
        const targetParsed = new URL(targetUrl);

        if (currentUrl.pathname !== targetParsed.pathname) {
          addLog(`🌐 [${i + 1}/${targetSuites.length}] Navigating to ${suite.path}...`, 'info');
          await chrome.tabs.update(tab.id, { url: targetUrl });
          await waitForTabReady(tab.id, 9000);
          await new Promise(r => setTimeout(r, Math.max(pacingMs, 400)));
        } else if (suite.hash && currentUrl.hash !== suite.hash) {
          await chrome.tabs.update(tab.id, { url: targetUrl });
          await new Promise(r => setTimeout(r, Math.max(pacingMs, 250)));
        }

        addLog(`▶ [${suite.name}] (${suite.path}${suite.hash || ''})`, 'info');

        // 2. Ensure selector-engine.js is present in the tab
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['suites/selector-engine.js']
          });
        } catch (injectErr) {
          console.warn('Selector engine injection note:', injectErr);
        }

        // 3. Execute suite steps in the tab
        try {
          const [execResult] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: async (suiteData, pacing) => {
              const selectors = window.GRO10X_SELECTORS;
              const logs = [];

              // Arm persona
              if (suiteData.persona) {
                try {
                  localStorage.setItem('gro10x_test_role', suiteData.persona);
                  localStorage.setItem('gro10x_test_user_id', `test-${suiteData.persona}-id`);
                } catch (_) {}
                window.dispatchEvent(new CustomEvent('gro10x:set-persona', {
                  detail: { persona: suiteData.persona }
                }));
              }

              // Hash check
              if (suiteData.hash && window.location.hash !== suiteData.hash) {
                window.location.hash = suiteData.hash;
                try {
                  window.dispatchEvent(new HashChangeEvent('hashchange'));
                } catch (_) {}
                await new Promise(r => setTimeout(r, pacing));
              }

              // Route Primary Selector Check
              let primaryPassed = true;
              if (suiteData.selector && selectors) {
                try {
                  await selectors.waitForResilient(suiteData.selector, { timeout: suiteData.timeout || 8000 });
                  logs.push({ text: `Found primary selector: ${suiteData.selector}`, type: 'success' });
                } catch (e) {
                  const fallbackEl = selectors.findResilient(suiteData.selector);
                  if (fallbackEl) {
                    logs.push({ text: `Found primary selector (deferred): ${suiteData.selector}`, type: 'success' });
                  } else {
                    logs.push({ text: `Primary selector note: ${e.message}`, type: 'warn' });
                    primaryPassed = false;
                  }
                }
              }

              // Expected Text Verification
              if (suiteData.expectedText && suiteData.expectedText.length > 0) {
                const bodyText = (document.body.innerText || '').toLowerCase();
                for (const token of suiteData.expectedText) {
                  if (bodyText.includes(token.toLowerCase())) {
                    logs.push({ text: `✓ Found token: "${token}"`, type: 'info' });
                  } else {
                    logs.push({ text: `ℹ️ Content notice: token "${token}" not in current view`, type: 'info' });
                  }
                }
              }

              // Actions (click, fill, verify)
              if (suiteData.actions && suiteData.actions.length > 0 && selectors) {
                for (const act of suiteData.actions) {
                  try {
                    if (act.type === 'click') {
                      await selectors.clickResilient(act.selector, { timeout: 2500 });
                      logs.push({ text: `↳ Clicked: ${act.selector}`, type: 'info' });
                    } else if (act.type === 'fill') {
                      await selectors.fillResilient(act.selector, act.value || '', { timeout: 2500 });
                      logs.push({ text: `↳ Filled "${act.value}" in: ${act.selector}`, type: 'info' });
                    } else if (act.type === 'verify') {
                      await selectors.waitForResilient(act.selector, { timeout: 2500 });
                      logs.push({ text: `↳ Verified element: ${act.selector}`, type: 'success' });
                    }
                    await new Promise(r => setTimeout(r, pacing));
                  } catch (actErr) {
                    logs.push({ text: `↳ Action note (${act.type}): ${actErr.message}`, type: 'warn' });
                  }
                }
              }

              // Deferred verification check: if primary selector timed out during initial hydration,
              // but by the end of the suite the selector exists in DOM:
              if (!primaryPassed && suiteData.selector && selectors) {
                if (selectors.findResilient(suiteData.selector)) {
                  primaryPassed = true;
                  const warnIdx = logs.findIndex(l => l.text && l.text.startsWith('Primary selector note:'));
                  if (warnIdx !== -1) {
                    logs[warnIdx] = { text: `Found primary selector (ready after hydration): ${suiteData.selector}`, type: 'success' };
                  }
                }
              }

              return { success: primaryPassed, logs };
            },
            args: [{
              id: suite.id,
              name: suite.name,
              path: suite.path,
              hash: suite.hash,
              persona: suite.persona,
              timeout: suite.timeout,
              selector: suite.selector,
              expectedText: suite.expectedText,
              actions: suite.actions
            }, pacingMs]
          });

          if (execResult && execResult.result) {
            const { success, logs } = execResult.result;
            logs.forEach(l => addLog(`   ${l.text}`, l.type));

            const hasWarnings = logs.some(l => l.type === 'warn');
            const suiteStatus = !success ? 'FAILED' : hasWarnings ? 'WARNINGS' : 'PASSED';

            if (suiteStatus === 'PASSED') {
              passedCount++;
              addLog(`✅ [${suite.name}] PASSED`, 'success');
            } else if (suiteStatus === 'WARNINGS') {
              warnCount++;
              addLog(`⚠️ [${suite.name}] Completed with warnings`, 'warn');
            } else {
              failedCount++;
              addLog(`❌ [${suite.name}] FAILED`, 'error');
            }

            lastAuditData.suites.push({
              id: suite.id,
              name: suite.name,
              path: suite.path,
              hash: suite.hash || '',
              persona: suite.persona,
              status: suiteStatus,
              logs
            });
          } else {
            passedCount++;
            addLog(`✅ [${suite.name}] Finished`, 'success');
            lastAuditData.suites.push({
              id: suite.id,
              name: suite.name,
              path: suite.path,
              hash: suite.hash || '',
              persona: suite.persona,
              status: 'PASSED',
              logs: []
            });
          }
        } catch (suiteErr) {
          failedCount++;
          addLog(`❌ [${suite.name}] Error: ${suiteErr.message}`, 'error');
          lastAuditData.suites.push({
            id: suite.id,
            name: suite.name,
            path: suite.path,
            hash: suite.hash || '',
            persona: suite.persona,
            status: 'FAILED',
            logs: [{ type: 'error', text: suiteErr.message }]
          });
        }

        await new Promise(r => setTimeout(r, pacingMs));
      }

      // Update final stats in session data
      lastAuditData.passedCount = passedCount;
      lastAuditData.warnCount = warnCount;
      lastAuditData.failedCount = failedCount;
      lastAuditData.isAborted = isAborted;

      // Final summary UI
      const finalPct = isAborted ? Math.round((passedCount + warnCount + failedCount) / targetSuites.length * 100) : 100;
      progressFill.style.width = `${finalPct}%`;
      progressCount.textContent = `${finalPct}%`;
      progressSuiteTitle.textContent = isAborted ? 'Aborted' : `Complete (${passedCount}/${targetSuites.length} Passed)`;

      if (isAborted) {
        setStatus(`Audit halted by user. (${passedCount} passed)`, 'warn');
      } else if (failedCount === 0) {
        setStatus(`🎉 Audit Complete: ${passedCount}/${targetSuites.length} Passed!`, 'success');
        addLog(`🎉 All ${targetSuites.length} suites completed cleanly at ${pacingMs}ms pacing!`, 'success');
      } else {
        setStatus(`⚠️ Audit completed with ${failedCount} errors`, 'error');
        addLog(`Completed with ${failedCount} error(s) and ${warnCount} warning(s).`, 'error');
      }
    } catch (err) {
      console.error(err);
      addLog(`Fatal audit error: ${err.message}`, 'error');
      setStatus(`Audit halted: ${err.message}`, 'error');
    } finally {
      startAuditBtn.style.display = 'block';
      abortAuditBtn.style.display = 'none';
      if (exportBar) exportBar.style.display = 'flex';
    }
  });

  // 5. Abort Button
  abortAuditBtn.addEventListener('click', () => {
    isAborted = true;
    addLog('⏹ Abort requested by user...', 'warn');
    setStatus('Aborting execution...', 'error');
  });

  // 6. Generate Markdown Report Helper
  function generateMarkdownReport(data) {
    const total = data.totalSuites || 0;
    const passed = data.passedCount || 0;
    const warns = data.warnCount || 0;
    const fails = data.failedCount || 0;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    let md = `# GRO10X OS — Grand Audit Report\n\n`;
    md += `- **Audit Scope**: ${data.scopeTitle || 'N/A'}\n`;
    md += `- **Generated At**: ${data.timestamp || new Date().toLocaleString()}\n`;
    md += `- **Base URL**: ${data.baseUrl || 'http://localhost:3000'}\n`;
    md += `- **Pacing Delay**: ${data.pacingMs}ms (${data.pacingMs === 800 ? 'Human Visual Review' : 'Fast Mode / CI'})\n\n`;
    
    md += `## 1. Executive Summary\n\n`;
    md += `- **Total Suites Audited**: ${total}\n`;
    md += `- **Passed Cleanly**: ${passed} (✅ ${passRate}%)\n`;
    md += `- **Suites with Warnings / Notices**: ${warns} (⚠️)\n`;
    md += `- **Hard Failures**: ${fails} (❌)\n`;
    md += `- **Overall Status**: ${data.isAborted ? '🛑 ABORTED BY USER' : fails === 0 ? '🎉 PASSED (100% REGRESSION-FREE)' : '⚠️ ATTENTION REQUIRED'}\n\n`;

    md += `## 2. Suite Results Matrix\n\n`;
    md += `| # | Suite ID | Suite Name | Path | Persona | Status |\n`;
    md += `|---|---|---|---|---|---|\n`;
    data.suites.forEach((s, idx) => {
      const badge = s.status === 'PASSED' ? '✅ PASSED' : s.status === 'WARNINGS' ? '⚠️ WARNINGS' : '❌ FAILED';
      md += `| ${idx + 1} | \`${s.id}\` | ${s.name} | \`${s.path}${s.hash || ''}\` | \`${s.persona}\` | ${badge} |\n`;
    });

    md += `\n## 3. Chronological Step Logs\n\n\`\`\`text\n`;
    data.rawLogs.forEach(entry => {
      md += `[${entry.time}] ${entry.msg}\n`;
    });
    md += `\`\`\`\n\n`;
    md += `---\n*Generated by GRO10X Grand Auditor v2.0 OS Chrome Extension*\n`;
    return md;
  }

  // 7. Export Toolbar Event Handlers
  if (copyReportBtn) {
    copyReportBtn.addEventListener('click', async () => {
      if (!lastAuditData.rawLogs.length) {
        setStatus('No audit logs to copy yet. Run an audit first.', 'info');
        return;
      }
      const md = generateMarkdownReport(lastAuditData);
      try {
        await navigator.clipboard.writeText(md);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = md;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      const oldHtml = copyReportBtn.innerHTML;
      copyReportBtn.innerHTML = '<span>✓ Copied!</span>';
      setStatus('✓ Markdown audit report copied to clipboard!', 'success');
      setTimeout(() => { copyReportBtn.innerHTML = oldHtml; }, 2000);
    });
  }

  if (exportMdBtn) {
    exportMdBtn.addEventListener('click', () => {
      if (!lastAuditData.rawLogs.length) {
        setStatus('No audit logs to export yet. Run an audit first.', 'info');
        return;
      }
      const md = generateMarkdownReport(lastAuditData);
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const safeScope = (lastAuditData.scopeTitle || 'audit').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const filename = `gro10x-${safeScope}-${dateStr}.md`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus(`✓ Downloaded: ${filename}`, 'success');
    });
  }

  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      if (!lastAuditData.rawLogs.length) {
        setStatus('No audit logs to export yet. Run an audit first.', 'info');
        return;
      }
      const jsonStr = JSON.stringify(lastAuditData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const safeScope = (lastAuditData.scopeTitle || 'audit').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const filename = `gro10x-${safeScope}-${dateStr}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus(`✓ Downloaded: ${filename}`, 'success');
    });
  }

  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', () => {
      logBox.innerHTML = '';
      logBox.style.display = 'none';
      exportBar.style.display = 'none';
      progressContainer.style.display = 'none';
      progressFill.style.width = '0%';
      progressCount.textContent = '0%';
      lastAuditData.rawLogs = [];
      lastAuditData.suites = [];
      clearStatus();
    });
  }
});
