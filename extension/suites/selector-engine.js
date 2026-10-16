/**
 * GRO10X OS — Resilient Selector Engine (selector-engine.js)
 * 
 * Supports ID + attribute + text combinations:
 * e.g. '#submitBtn', 'button[type="submit"]:has-text("Save")',
 * 'button:has-text("Launch New Deal"), #newDealBtn', etc.
 * 
 * Handles DOM mutations, dynamic component re-renders, and progressive disclosure states.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GRO10X_SELECTORS = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Check if an element is visible in the viewport and not hidden by styles
   */
  function isVisible(el) {
    if (!el || !(el instanceof Element)) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  /**
   * Parse a selector segment that might contain :has-text("...")
   * e.g. 'button[type="submit"]:has-text("Save")'
   * returns { baseSelector: 'button[type="submit"]', textMatch: 'Save' }
   */
  function parseTextSelector(singleSelector) {
    const textMatchRegex = /:has-text\((?:'([^']*)'|"([^"]*)")\)/i;
    const match = singleSelector.match(textMatchRegex);
    if (!match) {
      return { baseSelector: singleSelector.trim(), textMatch: null };
    }
    const baseSelector = singleSelector.replace(textMatchRegex, '').trim() || '*';
    const textMatch = match[1] !== undefined ? match[1] : match[2];
    return { baseSelector, textMatch };
  }

  /**
   * Query a single selector clause (baseSelector + textMatch)
   */
  function querySingle(clause, root = document) {
    const { baseSelector, textMatch } = parseTextSelector(clause);
    let elements = [];

    try {
      elements = Array.from(root.querySelectorAll(baseSelector));
    } catch (e) {
      console.warn(`[GRO10X Selector] Invalid querySelector: "${baseSelector}"`, e);
      return [];
    }

    if (!textMatch) {
      return elements;
    }

    const lowerTarget = textMatch.toLowerCase();
    return elements.filter(el => {
      const text = (el.textContent || '').trim().toLowerCase();
      const val = (el.value || '').trim().toLowerCase();
      const aria = (el.getAttribute('aria-label') || '').trim().toLowerCase();
      const title = (el.getAttribute('title') || '').trim().toLowerCase();
      return text.includes(lowerTarget) || val.includes(lowerTarget) || aria.includes(lowerTarget) || title.includes(lowerTarget);
    });
  }

  /**
   * Find first matching visible element across comma-separated or composite selector
   * e.g. '#submitBtn, button[type="submit"]:has-text("Save")'
   */
  function findResilient(compositeSelector, root = document) {
    const clauses = compositeSelector.split(',').map(s => s.trim()).filter(Boolean);
    
    // First pass: look for visible matches
    for (const clause of clauses) {
      const matches = querySingle(clause, root);
      const visible = matches.find(isVisible);
      if (visible) return visible;
    }

    // Second pass: return first existing match even if offscreen
    for (const clause of clauses) {
      const matches = querySingle(clause, root);
      if (matches.length > 0) return matches[0];
    }

    return null;
  }

  /**
   * Find all matching elements
   */
  function findAllResilient(compositeSelector, root = document) {
    const clauses = compositeSelector.split(',').map(s => s.trim()).filter(Boolean);
    const seen = new Set();
    const result = [];

    for (const clause of clauses) {
      const matches = querySingle(clause, root);
      for (const el of matches) {
        if (!seen.has(el)) {
          seen.add(el);
          result.push(el);
        }
      }
    }

    return result;
  }

  /**
   * Wait for a resilient selector to become visible with timeout
   */
  async function waitForResilient(compositeSelector, options = {}) {
    const timeout = options.timeout !== undefined ? options.timeout : 4500;
    const interval = options.interval || 100;
    const root = options.root || document;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const el = findResilient(compositeSelector, root);
      if (el && (isVisible(el) || el.type === 'file' || options.requireVisible === false)) {
        return el;
      }
      await new Promise(r => setTimeout(r, interval));
    }

    throw new Error(`Timeout after ${timeout}ms waiting for resilient selector: "${compositeSelector}"`);
  }

  /**
   * Resilient Click with automatic scroll-into-view and human pacing
   */
  async function clickResilient(compositeSelector, options = {}) {
    const el = await waitForResilient(compositeSelector, options);
    try {
      el.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    } catch (_) {}
    
    await new Promise(r => setTimeout(r, 60));
    
    el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
    el.click();

    return el;
  }

  /**
   * Resilient Fill for input fields
   */
  async function fillResilient(compositeSelector, value, options = {}) {
    const el = await waitForResilient(compositeSelector, options);
    try {
      el.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    } catch (_) {}
    await new Promise(r => setTimeout(r, 60));

    el.focus();
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return el;
  }

  return {
    isVisible,
    findResilient,
    findAllResilient,
    waitForResilient,
    clickResilient,
    fillResilient
  };
});
