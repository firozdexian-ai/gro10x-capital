/**
 * GRO10X OS — Main World Bridge (bridge-main.js)
 * 
 * Runs directly in the MAIN execution world of the page (document_start).
 * Arms the application with mock authentication tokens and test role personas.
 * Communicates strictly via CustomEvents to adhere to strict Content Security Policy (CSP),
 * completely eliminating inline <script> tags or eval() execution.
 */

(function () {
  'use strict';

  // Standard Persona Definitions across GRO10X OS
  const PERSONAS = {
    admin: {
      role: 'admin',
      userId: '00000000-0000-0000-0000-000000000000',
      email: 'admin@gro10x.com',
      token: 'mock-jwt-admin-token-gro10x-os-2026'
    },
    investor: {
      role: 'investor',
      userId: '00000000-0000-0000-0000-000000000002',
      email: 'investor@gro10x.com',
      token: 'mock-jwt-investor-token-gro10x-os-2026'
    },
    kam: {
      role: 'kam',
      userId: '00000000-0000-0000-0000-000000000001',
      email: 'kam@gro10x.com',
      token: 'mock-jwt-kam-token-gro10x-os-2026'
    },
    promoter: {
      role: 'promoter',
      userId: '00000000-0000-0000-0000-000000000003',
      email: 'promoter@gro10x.com',
      token: 'mock-jwt-promoter-token-gro10x-os-2026'
    },
    founder: {
      role: 'founder',
      userId: '00000000-0000-0000-0000-000000000004',
      email: 'founder@ororoasters.com',
      token: 'mock-jwt-founder-token-gro10x-os-2026'
    },
    public: null
  };

  /**
   * Arm localStorage with application mock token keys
   */
  function armTokens(personaKey) {
    try {
      const persona = PERSONAS[personaKey];
      if (!persona) {
        // Public persona: clear mock tokens
        localStorage.removeItem('gro10x_test_role');
        localStorage.removeItem('gro10x_test_user_id');
        localStorage.removeItem('token');
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('sb-refresh-token');
        console.log('[GRO10X Bridge] Mock tokens cleared (Public Persona active)');
        return { active: false, role: 'public' };
      }

      localStorage.setItem('gro10x_test_role', persona.role);
      localStorage.setItem('gro10x_test_user_id', persona.userId);
      localStorage.setItem('token', persona.token);
      localStorage.setItem('sb-access-token', persona.token);
      localStorage.setItem('sb-refresh-token', persona.token);

      console.log(`[GRO10X Bridge] Main World armed with [${persona.role.toUpperCase()}] mock tokens.`);
      return { active: true, role: persona.role, userId: persona.userId };
    } catch (err) {
      console.error('[GRO10X Bridge] Failed to arm localStorage tokens:', err);
      return { active: false, error: err.message };
    }
  }

  // Auto-arm if previously set in localStorage or default to current
  const existingRole = localStorage.getItem('gro10x_test_role');
  if (existingRole && PERSONAS[existingRole]) {
    armTokens(existingRole);
  }

  /**
   * CSP-Compliant CustomEvent Message Dispatcher & Listener
   * Communicates bidirectionally without any inline scripts or eval()
   */
  window.addEventListener('gro10x:set-persona', (event) => {
    const detail = event.detail || {};
    const personaKey = detail.persona || 'admin';
    const result = armTokens(personaKey);

    window.dispatchEvent(new CustomEvent('gro10x:bridge-response', {
      detail: {
        action: 'set-persona',
        success: !result.error,
        data: result
      }
    }));
  });

  window.addEventListener('gro10x:clear-persona', () => {
    const result = armTokens('public');
    window.dispatchEvent(new CustomEvent('gro10x:bridge-response', {
      detail: {
        action: 'clear-persona',
        success: true,
        data: result
      }
    }));
  });

  window.addEventListener('gro10x:bridge-query', () => {
    window.dispatchEvent(new CustomEvent('gro10x:bridge-response', {
      detail: {
        action: 'bridge-query',
        success: true,
        data: {
          currentRole: localStorage.getItem('gro10x_test_role') || 'public',
          currentUserId: localStorage.getItem('gro10x_test_user_id') || null,
          hasToken: !!localStorage.getItem('token'),
          url: window.location.href,
          pathname: window.location.pathname,
          hash: window.location.hash
        }
      }
    }));
  });

  // Expose global bridge inspector
  window.__GRO10X_BRIDGE__ = {
    version: '2.0.0',
    armTokens,
    PERSONAS,
    query: () => ({
      currentRole: localStorage.getItem('gro10x_test_role') || 'public',
      currentUserId: localStorage.getItem('gro10x_test_user_id') || null,
      hasToken: !!localStorage.getItem('token'),
      pathname: window.location.pathname,
      hash: window.location.hash
    })
  };

  console.log('[GRO10X Bridge] Main World Bridge initialized & ready.');
})();
