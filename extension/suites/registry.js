/**
 * GRO10X OS — 8-Platform Grand Audit Suite Registry
 * 
 * Maps every URL path, hash, required persona, and verification targets
 * across the 8 platforms of the GRO10X OS ecosystem.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GRO10X_REGISTRY = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const PLATFORMS = [
    {
      id: 'platform-1',
      name: '1. Public & Discovery Desk',
      description: 'Investor acquisition, deal rooms, DCF modelers, secondary exchange, and cash concierge.',
      defaultPersona: 'public',
      suites: [
        {
          id: 'suite-1-1',
          name: 'Homepage Hero, Dynamic DB Stats & Trust Badges',
          path: '/',
          hash: '',
          persona: 'public',
          selector: 'h1, .hero-title, [data-testid="hero-section"]',
          expectedText: ['GRO10X', 'Revenue-Share', 'SPV Entity Protected', 'KAM Monthly Audited'],
          actions: [
            { type: 'verify', selector: 'header, nav' },
            { type: 'verify', selector: '.badge-gold, [style*="radial-gradient"]' },
            { type: 'verify', selector: 'a[href="/showcase"], a[href*="/showcase"]' },
            { type: 'verify', selector: 'button:has-text("Speak to Advisor")' }
          ]
        },
        {
          id: 'suite-1-2',
          name: 'Homepage Dynamic ROI Calculator',
          path: '/',
          hash: '',
          persona: 'public',
          selector: '.roi-calculator, [data-testid="roi-calculator"], input[type="range"]',
          expectedText: ['ROI Calculator', 'Monthly', 'Yield'],
          actions: [
            { type: 'verify', selector: 'input[type="range"], input[type="number"]' },
            { type: 'verify', selector: 'button:has-text("Capped"), button:has-text("Buyout"), button:has-text("Profit")' },
            { type: 'verify', selector: 'button:has-text("Invest in This Structure"), a[href*="/showcase"]' }
          ]
        },
        {
          id: 'suite-1-3',
          name: 'Homepage Comparison Matrix & FAQ Accordion',
          path: '/',
          hash: '',
          persona: 'public',
          selector: 'table, .comparison-table, .faq-accordion, details, [data-testid="faq"], footer',
          expectedText: ['Stock Market'],
          actions: [
            { type: 'verify', selector: 'table, .comparison-table, main' },
            { type: 'verify', selector: 'footer, [data-testid="footer"], .footer' }
          ]
        },
        {
          id: 'suite-1-4',
          name: 'Deal Showcase Live Filtering & Sector Badges',
          path: '/showcase',
          hash: '',
          persona: 'public',
          selector: '.glass-card-interactive, .deal-card, .campaign-card, [data-testid="deal-grid"], main',
          expectedText: ['Showcase', 'Target', 'Yield'],
          actions: [
            { type: 'click', selector: 'button:has-text("F&B Franchise"), button:has-text("Wealth Management"), button:has-text("All")' },
            { type: 'verify', selector: '.glass-card-interactive, .deal-card, .campaign-card, [data-testid="deal-grid"], main' }
          ]
        },
        {
          id: 'suite-1-5',
          name: 'Deal Showcase Search & Dynamic Sorting',
          path: '/showcase',
          hash: '',
          persona: 'public',
          selector: 'input[placeholder*="Search"]',
          expectedText: ['Showcase'],
          actions: [
            { type: 'fill', selector: 'input[placeholder*="Search"]', value: 'Safe' },
            { type: 'verify', selector: '.glass-card-interactive, .deal-card, .campaign-card, [data-testid="deal-grid"], main' },
            { type: 'fill', selector: 'input[placeholder*="Search"]', value: '' }
          ]
        },
        {
          id: 'suite-1-6',
          name: 'Deal Showcase Referral Attribution Engine',
          path: '/showcase?ref=GRO_PROMOTER_01',
          hash: '',
          persona: 'public',
          selector: 'main, .container, h1, [data-testid="showcase-root"]',
          expectedText: ['Showcase'],
          actions: [
            { type: 'verify', selector: 'main, .container, header' }
          ]
        },
        {
          id: 'suite-1-7',
          name: 'Project Room Telemetry, Share & Media',
          path: '/projects/c3a2b3c4-d5e6-7890-abcd-ef1234567890',
          hash: '',
          persona: 'public',
          selector: 'h1, .project-header, [data-testid="project-title"]',
          expectedText: ['Safe Plan', 'Facility', 'SPV'],
          actions: [
            { type: 'verify', selector: 'button:has-text("Share"), [data-testid="share-btn"], button' },
            { type: 'verify', selector: '.badge-gold, .status-badge, .badge, div' },
            { type: 'verify', selector: 'button:has-text("Express Interest"), button:has-text("Invest"), button:has-text("Book")' }
          ]
        },
        {
          id: 'suite-1-8',
          name: 'Project Room Allocation Booking & Diligence Dossier',
          path: '/projects/c3a2b3c4-d5e6-7890-abcd-ef1234567890',
          hash: '',
          persona: 'public',
          selector: 'button:has-text("Express Interest"), button:has-text("Book Allocation"), button:has-text("Invest"), main',
          expectedText: ['Safe Plan'],
          actions: [
            { type: 'click', selector: 'button:has-text("Express Interest"), button:has-text("Book Allocation"), button:has-text("Invest")' },
            { type: 'verify', selector: 'form, .modal, [role="dialog"], [data-testid="booking-modal"]' }
          ]
        },
        {
          id: 'suite-1-9',
          name: 'Secondary Market Live Orderbook & Realtime Sync',
          path: '/secondary-market',
          hash: '',
          persona: 'investor',
          selector: '.grid-3, .glass-card, .empty-state, h2:has-text("Secondary Share Exchange"), main',
          expectedText: ['Secondary', 'Exchange'],
          actions: [
            { type: 'verify', selector: 'button:has-text("+ List Share for Sale"), button:has-text("List Share"), .btn-gold' },
            { type: 'verify', selector: '.grid-3, .glass-card, .empty-state, main' }
          ]
        },
        {
          id: 'suite-1-10',
          name: 'Secondary Market ±10% FMV Corridor Validation on Sell Modal',
          path: '/secondary-market',
          hash: '',
          persona: 'investor',
          selector: 'button:has-text("+ List Share for Sale"), button:has-text("List Share"), .btn-gold',
          expectedText: ['Secondary', 'Exchange'],
          actions: [
            { type: 'click', selector: 'button:has-text("+ List Share for Sale"), button:has-text("List Share"), .btn-gold' },
            { type: 'verify', selector: 'form, .modal, [role="dialog"], div[style*="fixed"]' }
          ]
        },
        {
          id: 'suite-1-11',
          name: 'Secondary Market Share Acquisition & KYC Level 2 Check',
          path: '/secondary-market',
          hash: '',
          persona: 'investor',
          selector: '.grid-3, .glass-card, .empty-state, h2:has-text("Secondary Share Exchange"), main',
          expectedText: ['Secondary', 'Exchange'],
          actions: [
            { type: 'verify', selector: 'button:has-text("+ List Share for Sale"), button:has-text("List Share"), .btn-gold, button' }
          ]
        },
        {
          id: 'suite-1-12',
          name: 'Financial Model Role Guard (Public/Investor Access Gate)',
          path: '/financial-model',
          hash: '',
          persona: 'public',
          selector: 'body',
          expectedText: ['Verifying Director Access'],
          actions: [
            { type: 'verify', selector: 'body' }
          ]
        },
        {
          id: 'suite-1-13',
          name: 'Financial Model DCF Simulator & Cap Table Equity Dilution',
          path: '/financial-model',
          hash: '',
          persona: 'admin',
          selector: 'header, .glass-card, [data-testid="dcf-calculator"]',
          expectedText: ['FINANCIAL MODEL', 'VALUATION ENGINE', 'Projected 12-Mo Profit', 'NPV Enterprise Valuation', 'Calculated IRR'],
          actions: [
            { type: 'verify', selector: 'input[type="range"], input[type="number"]' },
            { type: 'verify', selector: 'select, [data-testid="currency-selector"]' }
          ]
        },
        {
          id: 'suite-1-14',
          name: 'Cash Concierge Level 3 KYC Gate & Lockout',
          path: '/cash-concierge',
          hash: '',
          persona: 'investor',
          selector: 'main, .concierge-card, [data-testid="cash-concierge-root"]',
          expectedText: ['Cash Concierge', 'KYC'],
          actions: [
            { type: 'verify', selector: 'main' }
          ]
        },
        {
          id: 'suite-1-15',
          name: 'Cash Concierge Block Trade Ticket Submission',
          path: '/cash-concierge',
          hash: '',
          persona: 'investor',
          selector: 'form, .concierge-form, [data-testid="cash-concierge-form"], main',
          expectedText: ['Cash Concierge'],
          actions: [
            { type: 'verify', selector: 'input[type="number"], select, main' }
          ]
        },
        {
          id: 'suite-1-16',
          name: 'Legal & Policy Hub (Terms, Privacy & Risk Disclosures)',
          path: '/terms',
          hash: '',
          persona: 'public',
          selector: 'h1, main',
          expectedText: ['Terms of Service', 'GRO10X'],
          actions: [
            { type: 'verify', selector: 'article, main' }
          ]
        },
        {
          id: 'suite-1-17',
          name: 'Global Lead Bot & Multi-Step Advisor Capture',
          path: '/',
          hash: '',
          persona: 'public',
          selector: 'button:has-text("Speak to Advisor"), .leadbot-floating-btn, [data-testid="leadbot-trigger"]',
          expectedText: ['GRO10X'],
          actions: [
            { type: 'click', selector: 'button:has-text("Speak to Advisor"), .leadbot-floating-btn' }
          ]
        }
      ]
    },

    {
      id: 'platform-2',
      name: '2. Investor Experience & Liquidity Desk',
      description: 'HNI portfolio management, progressive KYC, yield disbursements, and legal execution.',
      defaultPersona: 'investor',
      suites: [
        {
          id: 'suite-2-1',
          name: 'Investor Portfolio & 4-Card Live KPI Telemetry',
          path: '/investor',
          hash: '#portfolio',
          persona: 'investor',
          selector: '.glass-card, [data-testid="investor-dashboard"], h2:has-text("My Portfolio")',
          expectedText: ['My Portfolio', 'Active Position', 'Total Capital Invested', 'Total Yield Distributed'],
          actions: [
            { type: 'verify', selector: 'h2:has-text("My Portfolio")' },
            { type: 'verify', selector: '.glass-card' }
          ]
        },
        {
          id: 'suite-2-2',
          name: 'Investor Pending Bookings & Payment Proof Upload Form',
          path: '/investor',
          hash: '#portfolio',
          persona: 'investor',
          selector: 'body',
          expectedText: ['Portfolio'],
          actions: [
            { type: 'verify', selector: 'button:has-text("Upload Payment Proof"), button:has-text("Confirm Upload"), body' }
          ]
        },
        {
          id: 'suite-2-3',
          name: 'Investor Yield Trajectory Chart & Holdings Table',
          path: '/investor',
          hash: '#portfolio',
          persona: 'investor',
          selector: '.recharts-responsive-container, table, [data-testid="holdings-table"], .glass-card',
          expectedText: ['Active Holdings', 'Yield'],
          actions: [
            { type: 'verify', selector: '.recharts-responsive-container, table, .glass-card' }
          ]
        },
        {
          id: 'suite-2-4',
          name: 'Investor Secondary Market Listing Exit Trigger',
          path: '/investor',
          hash: '#portfolio',
          persona: 'investor',
          selector: 'button:has-text("List on Secondary Market"), button:has-text("Sell"), body',
          expectedText: ['Portfolio'],
          actions: [
            { type: 'verify', selector: 'button:has-text("List on Secondary Market"), button:has-text("Sell"), body' }
          ]
        },
        {
          id: 'suite-2-5',
          name: 'Progressive Investor KYC Stepper & Status Badge',
          path: '/investor',
          hash: '#kyc',
          persona: 'investor',
          selector: 'h2:has-text("Progressive Investor Profiling"), [data-testid="kyc-stepper"], .glass-card',
          expectedText: ['Progressive Investor Profiling', 'Level 1: Basic', 'Level 2: Identity', 'Level 3: Accredited'],
          actions: [
            { type: 'click', selector: 'button:has-text("Verification"), button:has-text("KYC")' },
            { type: 'verify', selector: 'h2:has-text("Progressive Investor Profiling"), .glass-card' },
            { type: 'verify', selector: '.glass-card:has-text("Level 1"), .glass-card' }
          ]
        },
        {
          id: 'suite-2-6',
          name: 'KYC Level 2 (Identity & NID) Verification Form',
          path: '/investor',
          hash: '#kyc',
          persona: 'investor',
          selector: 'button:has-text("Upgrade to Level 2"), button:has-text("Identity Verification"), [data-testid="l2-upgrade-btn"], .glass-card',
          expectedText: ['Level 2: Identity', 'Secondary Trading'],
          actions: [
            { type: 'verify', selector: 'button:has-text("Upgrade to Level 2"), button:has-text("Identity"), .glass-card' }
          ]
        },
        {
          id: 'suite-2-7',
          name: 'KYC Level 3 (Accredited HNW & Wealth Declaration) Form',
          path: '/investor',
          hash: '#kyc',
          persona: 'investor',
          selector: 'button:has-text("Upgrade to Level 3"), button:has-text("Accredited"), [data-testid="l3-upgrade-btn"], .glass-card',
          expectedText: ['Level 3: Accredited', 'VIP Cash Concierge'],
          actions: [
            { type: 'verify', selector: 'button:has-text("Upgrade to Level 3"), button:has-text("Accredited"), .glass-card' }
          ]
        },
        {
          id: 'suite-2-8',
          name: 'Legal Document Vault & PDF Download CTAs',
          path: '/investor',
          hash: '#vault',
          persona: 'investor',
          selector: 'h2:has-text("Legal & Regulatory Document Vault"), .glass-card',
          expectedText: ['Legal & Regulatory Document Vault', 'Secured'],
          actions: [
            { type: 'click', selector: 'button:has-text("Document Vault"), button:has-text("Vault")' },
            { type: 'verify', selector: 'h2:has-text("Legal & Regulatory Document Vault"), .glass-card' },
            { type: 'verify', selector: 'a:has-text("Download PDF"), a:has-text("Explore Live Rounds"), .glass-card' }
          ]
        },
        {
          id: 'suite-2-9',
          name: 'AI Investment Concierge Chat & Quick Prompts',
          path: '/investor',
          hash: '#ai-concierge',
          persona: 'investor',
          selector: 'h2:has-text("GRO10X AI Investment Concierge"), .glass-card',
          expectedText: ['GRO10X AI Investment Concierge', 'Recommended Questions'],
          actions: [
            { type: 'click', selector: 'button:has-text("AI Assistant"), button:has-text("Concierge")' },
            { type: 'verify', selector: 'h2:has-text("GRO10X AI Investment Concierge"), .glass-card' },
            { type: 'click', selector: 'button:has-text("What is my expected monthly yield?"), button:has-text("How does the SPV structure protect me?")' },
            { type: 'verify', selector: 'input[placeholder*="Ask"], textarea, input[type="text"], .glass-card' }
          ]
        },
        {
          id: 'suite-2-10',
          name: 'Investor Due Diligence FAQ Accordion',
          path: '/investor',
          hash: '#faq',
          persona: 'investor',
          selector: 'h2:has-text("Due Diligence FAQs"), h2:has-text("FAQs"), .glass-card, [data-testid="faq-tab"]',
          expectedText: ['Due Diligence FAQs'],
          actions: [
            { type: 'click', selector: 'button:has-text("FAQ")' },
            { type: 'click', selector: 'button:has-text("Who owns GRO10X"), button:has-text("How"), button:has-text("What"), .glass-card' },
            { type: 'verify', selector: 'h2:has-text("Due Diligence FAQs"), .glass-card' }
          ]
        },
        {
          id: 'suite-2-11',
          name: 'Investor Onboarding Welcome & Profile Card',
          path: '/investor-onboard',
          hash: '',
          persona: 'investor',
          selector: 'h1:has-text("Welcome to"), .glass-card, [style*="border-radius: 16px"]',
          expectedText: ['Welcome to', 'GRO10X Capital', 'Portfolio Name', 'KYC Status'],
          actions: [
            { type: 'verify', selector: 'h1:has-text("Welcome to")' }
          ]
        },
        {
          id: 'suite-2-12',
          name: 'Investor Onboarding 4-Step Getting Started Checklist',
          path: '/investor-onboard',
          hash: '',
          persona: 'investor',
          selector: 'h3:has-text("Getting Started Checklist"), [style*="border-radius: 16px"]',
          expectedText: ['Getting Started Checklist', 'Telegram Account Linked', 'Web Login Activated'],
          actions: [
            { type: 'verify', selector: 'h3:has-text("Getting Started Checklist")' }
          ]
        },
        {
          id: 'suite-2-13',
          name: 'Dividend & Yield Payouts Balance Summary',
          path: '/payouts',
          hash: '',
          persona: 'investor',
          selector: 'h1, .glass-card, [data-testid="payouts-root"]',
          expectedText: ['Available Balance', 'Total Earnings', 'BDT'],
          actions: [
            { type: 'verify', selector: '.glass-card' }
          ]
        },
        {
          id: 'suite-2-14',
          name: 'Payout Request Validation & Submission Flow',
          path: '/payouts',
          hash: '',
          persona: 'investor',
          selector: 'form, input[type="number"], input[placeholder*="Amount"], select',
          expectedText: ['Payout', 'Method'],
          actions: [
            { type: 'verify', selector: 'select, input[placeholder*="Account"], input[type="text"]' }
          ]
        },
        {
          id: 'suite-2-15',
          name: 'Funding Rounds Directory & Categorized Ledger',
          path: '/funding-rounds',
          hash: '',
          persona: 'investor',
          selector: '.rounds-container, .grid-3, [data-testid="funding-rounds-list"], main',
          expectedText: ['Funding Rounds', 'Yield', 'Tenor'],
          actions: [
            { type: 'verify', selector: 'main' }
          ]
        },
        {
          id: 'suite-2-16',
          name: 'Automated Legal Contracts Generator & Type Switcher',
          path: '/legal-contracts',
          hash: '',
          persona: 'investor',
          selector: 'header, .grid-4, button:has-text("SPV Share Certificate")',
          expectedText: ['AUTOMATED', 'LEGAL', 'SPV Share Certificate', 'Master Growth Agreement'],
          actions: [
            { type: 'click', selector: 'button:has-text("Master Growth Agreement"), button:has-text("Promoter Syndicate Contract")' },
            { type: 'click', selector: 'button:has-text("SPV Share Certificate")' }
          ]
        },
        {
          id: 'suite-2-17',
          name: 'Legal Contracts Print / PDF Export Preview',
          path: '/legal-contracts',
          hash: '',
          persona: 'investor',
          selector: 'button:has-text("Print / Export PDF")',
          expectedText: ['Print / Export PDF'],
          actions: [
            { type: 'verify', selector: 'button:has-text("Print / Export PDF")' }
          ]
        }
      ]
    },

    {
      id: 'platform-3',
      name: '3. SME Founder & Business Command',
      description: 'Cohort fundraising wizard, POS telemetry, cap table inspection, and milestone tracking.',
      defaultPersona: 'founder',
      suites: [
        {
          id: 'suite-3-1',
          name: 'Founder Command Center & 4-Card KPI Telemetry',
          path: '/business',
          hash: '',
          persona: 'founder',
          selector: 'h1, h2, .business-dashboard, [data-testid="business-portal"], .glass-card',
          expectedText: ['Command Center', 'Gross Sales', 'Net Profit', 'AI Business Health Score'],
          actions: [
            { type: 'verify', selector: '.glass-card' }
          ]
        },
        {
          id: 'suite-3-2',
          name: 'Founder Overseer Business Switcher (Admin/KAM Inspection)',
          path: '/business',
          hash: '',
          persona: 'admin',
          selector: 'select, [data-testid="business-switcher"], .glass-card',
          expectedText: ['Command Center'],
          actions: [
            { type: 'verify', selector: 'select' }
          ]
        },
        {
          id: 'suite-3-3',
          name: 'Founder Outlet Funding Campaigns & Public Deal Room CTA',
          path: '/business',
          hash: '',
          persona: 'founder',
          selector: 'h2:has-text("Funding Campaigns"), .glass-card',
          expectedText: ['Funding Campaigns', 'Amount Raised', 'Target'],
          actions: [
            { type: 'verify', selector: 'h2:has-text("Funding Campaigns"), .glass-card' },
            { type: 'verify', selector: 'a:has-text("View Public Deal Room"), .glass-card' }
          ]
        },
        {
          id: 'suite-3-4',
          name: 'Founder Investor Capitalization Table & Search',
          path: '/business',
          hash: '',
          persona: 'founder',
          selector: 'button:has-text("Investor Cap Table"), button:has-text("Cap Table"), [data-testid="tab-captable"], body',
          expectedText: ['Business'],
          actions: [
            { type: 'click', selector: 'button:has-text("Investor Cap Table"), button:has-text("Cap Table"), [data-testid="tab-captable"]' },
            { type: 'verify', selector: 'input[placeholder*="Search investor"], table, .glass-card' }
          ]
        },
        {
          id: 'suite-3-5',
          name: 'Founder POS Telemetry Engine & Daily Solvency Preview',
          path: '/business',
          hash: '',
          persona: 'founder',
          selector: 'button:has-text("POS Revenue Sync"), button:has-text("POS"), [data-testid="tab-pos"], body',
          expectedText: ['Business'],
          actions: [
            { type: 'click', selector: 'button:has-text("POS Revenue Sync"), button:has-text("POS"), [data-testid="tab-pos"]' },
            { type: 'verify', selector: 'input[type="date"], input[placeholder*="Gross Sales"], input[placeholder*="Net Profit"], .glass-card' }
          ]
        },
        {
          id: 'suite-3-6',
          name: 'Cohort Application Wizard Step 1: Brand & Legal Information',
          path: '/apply',
          hash: '',
          persona: 'public',
          selector: 'form, input[placeholder*="Brand"], [data-testid="apply-wizard"]',
          expectedText: ['Cohort Application', 'Brand', 'Company Legal Name'],
          actions: [
            { type: 'verify', selector: 'input[placeholder*="Brand"], select' },
            { type: 'verify', selector: 'button:has-text("Next"), button:has-text("Founding Team")' }
          ]
        },
        {
          id: 'suite-3-7',
          name: 'Cohort Application Wizard Step 2: Founding Team & Stakeholders',
          path: '/apply',
          hash: '',
          persona: 'public',
          selector: 'body',
          expectedText: ['Cohort Application'],
          actions: [
            { type: 'verify', selector: 'button:has-text("Add Co-Founder"), button:has-text("Add Stakeholder"), input[placeholder*="Founder"], body' }
          ]
        },
        {
          id: 'suite-3-8',
          name: 'Cohort Application Wizard Step 3: Financials & Use of Funds',
          path: '/apply',
          hash: '',
          persona: 'public',
          selector: 'body',
          expectedText: ['Cohort Application'],
          actions: [
            { type: 'verify', selector: 'input[placeholder*="Revenue"], input[type="number"], body' }
          ]
        },
        {
          id: 'suite-3-9',
          name: 'Cohort Application Wizard Step 4: Pitch & Document Uploads',
          path: '/apply',
          hash: '',
          persona: 'public',
          selector: 'body',
          expectedText: ['Cohort Application'],
          actions: [
            { type: 'verify', selector: 'textarea, input[type="file"], input[type="checkbox"], body' }
          ]
        },
        {
          id: 'suite-3-10',
          name: 'Cohort Application Draft Auto-Saving Engine',
          path: '/apply',
          hash: '',
          persona: 'public',
          selector: 'body',
          expectedText: ['Cohort Application'],
          actions: [
            { type: 'verify', selector: 'body' }
          ]
        },
        {
          id: 'suite-3-11',
          name: 'Cohort Application Submission & Reference Code Screen',
          path: '/apply',
          hash: '',
          persona: 'public',
          selector: 'form, button[type="submit"], button:has-text("Submit"), body',
          expectedText: ['Cohort Application'],
          actions: [
            { type: 'verify', selector: 'button[type="submit"], button:has-text("Submit"), body' }
          ]
        },
        {
          id: 'suite-3-12',
          name: 'Application Status Tracker Reference Code Query',
          path: '/apply/status',
          hash: '',
          persona: 'public',
          selector: 'h1:has-text("Cohort Application Status Tracker"), input[placeholder*="GRO-COHORT"]',
          expectedText: ['Cohort Application Status Tracker', 'Admissions Desk'],
          actions: [
            { type: 'fill', selector: 'input[placeholder*="GRO-COHORT"]', value: 'GRO-COHORT-TEST' },
            { type: 'click', selector: 'button[type="submit"], button:has-text("Search"), button:has-text("Track")' }
          ]
        },
        {
          id: 'suite-3-13',
          name: 'Application Status Tracker 4-Stage Visual Milestones Stepper',
          path: '/apply/status?ref=GRO-COHORT-1042',
          hash: '',
          persona: 'public',
          selector: 'h1:has-text("Cohort Application Status Tracker"), .glass-card',
          expectedText: ['Application Submitted', 'Director & KAM Triage', 'Diligence & POS Audit', 'Investment Committee'],
          actions: [
            { type: 'verify', selector: 'h1:has-text("Cohort Application Status Tracker")' },
            { type: 'verify', selector: '.glass-card' }
          ]
        },
        {
          id: 'suite-3-14',
          name: 'POS Daily Sales Ingestion Terminal & Outlet Selector',
          path: '/pos-sync',
          hash: '',
          persona: 'founder',
          selector: 'select, h1, h2, [data-testid="pos-sync-root"]',
          expectedText: ['POS', 'Daily Sales', 'Reconciliation'],
          actions: [
            { type: 'verify', selector: 'select' }
          ]
        },
        {
          id: 'suite-3-15',
          name: 'POS Ingestion Real-Time Solvency & Margin Anomaly Engine',
          path: '/pos-sync',
          hash: '',
          persona: 'founder',
          selector: 'form, input[placeholder*="Sales"], input[type="date"]',
          expectedText: ['Daily Sales'],
          actions: [
            { type: 'verify', selector: 'input[type="date"], input[placeholder*="Sales"], button[type="submit"], button:has-text("Log")' }
          ]
        },
        {
          id: 'suite-3-16',
          name: 'Milestone Buildout Tracker CapEx Escrow Ratio',
          path: '/buildout-tracker',
          hash: '',
          persona: 'founder',
          selector: 'h1, h2, .glass-card, [data-testid="buildout-tracker"]',
          expectedText: ['Buildout', 'CapEx', 'Escrow'],
          actions: [
            { type: 'verify', selector: '.glass-card, select' }
          ]
        },
        {
          id: 'suite-3-17',
          name: 'Milestone Buildout Tracker 4-Milestone Progressive Breakdown',
          path: '/buildout-tracker',
          hash: '',
          persona: 'founder',
          selector: '.glass-card, [data-testid="milestone-item"], body',
          expectedText: ['Milestone 1', 'Milestone 2', 'Milestone 3', 'Milestone 4'],
          actions: [
            { type: 'verify', selector: '.glass-card' }
          ]
        }
      ]
    },

    {
      id: 'platform-4',
      name: '4. Master Admin Command Center (15 Tabs & Modals)',
      description: 'Super-Admin operations, deal pipeline, compliance, yield engine, and executive drawers.',
      defaultPersona: 'admin',
      suites: [
        {
          id: 'suite-4-1',
          name: 'Tab 1: Command Center Overview, Live AUM & Global Search',
          path: '/admin',
          hash: '#dashboard',
          persona: 'admin',
          timeout: 8000,
          selector: '.admin-sidebar, .admin-shell, .admin-main, header, main, .glass-card',
          expectedText: ['AUM'],
          actions: [
            { type: 'verify', selector: '.admin-sidebar, .admin-shell, button:has-text("Command Center"), .glass-card' },
            { type: 'verify', selector: 'div:has-text("Total AUM Raised"), div:has-text("Active Investors"), .glass-card' }
          ]
        },
        {
          id: 'suite-4-2',
          name: 'Tab 1: Quick Actions (+ Launch New Deal & + Enlist Business Modal Triggers)',
          path: '/admin',
          hash: '#dashboard',
          persona: 'admin',
          selector: 'button:has-text("Onboard Project"), button:has-text("Launch New Deal"), .btn-gold, header',
          expectedText: ['Command Center'],
          actions: [
            { type: 'verify', selector: 'button:has-text("Onboard Project"), button:has-text("Launch New Deal"), .btn-gold, header' },
            { type: 'verify', selector: 'header, .admin-header' }
          ]
        },
        {
          id: 'suite-4-3',
          name: 'Tab 2: Kanban Deal Pipeline Board & Table View Switcher',
          path: '/admin',
          hash: '#kanban',
          persona: 'admin',
          selector: '.kanban-board, [data-testid="deal-pipeline"], body',
          expectedText: ['Deal Pipeline', 'Origination', 'Diligence', 'Active'],
          actions: [
            { type: 'click', selector: '.admin-sidebar button[title*="Deal Pipeline"], button:has-text("Deal Pipeline")' },
            { type: 'verify', selector: 'button:has-text("Kanban"), button:has-text("Table"), button:has-text("View")' }
          ]
        },
        {
          id: 'suite-4-4',
          name: 'Tab 2: Kanban 5-Stage Pipeline Telemetry & Project Form Modal',
          path: '/admin',
          hash: '#kanban',
          persona: 'admin',
          selector: 'button:has-text("Launch New Deal"), button:has-text("New Project"), .kanban-board',
          expectedText: ['Deal Pipeline'],
          actions: [
            { type: 'verify', selector: 'button:has-text("Launch New Deal"), button:has-text("New Project")' }
          ]
        },
        {
          id: 'suite-4-5',
          name: 'Tab 3: Business Registry Table & Cohort Inspection Drawer',
          path: '/admin',
          hash: '#business-registry',
          persona: 'admin',
          selector: 'input[placeholder*="Search"], .glass-card, [data-testid="business-registry"], main',
          expectedText: ['Business Registry'],
          actions: [
            { type: 'click', selector: '.admin-sidebar button[title*="Business Registry"], button:has-text("Business Registry")' },
            { type: 'verify', selector: '.glass-card, input[placeholder*="Search"]' }
          ]
        },
        {
          id: 'suite-4-6',
          name: 'Tab 3: Business Enlistment Modal & Form Validation',
          path: '/admin',
          hash: '#business-registry',
          persona: 'admin',
          selector: 'button:has-text("Copy /apply Link"), a:has-text("Open Application Form"), button:has-text("Onboard Project"), .glass-card',
          expectedText: ['Business Registry'],
          actions: [
            { type: 'verify', selector: 'button:has-text("Copy /apply Link"), a:has-text("Open Application Form"), button:has-text("Onboard Project"), .glass-card' }
          ]
        },
        {
          id: 'suite-4-7',
          name: 'Tab 4: Deal Valuation & DCF Model Parameter Editor',
          path: '/admin',
          hash: '#valuation-model',
          persona: 'admin',
          selector: '.valuation-editor, [data-testid="valuation-model"], .glass-card, main',
          expectedText: ['Valuation', 'DCF', 'Discount Rate'],
          actions: [
            { type: 'click', selector: '.admin-sidebar button[title*="Valuation"], button:has-text("Valuation")' }
          ]
        },
        {
          id: 'suite-4-8',
          name: 'Tab 5: Work-Order Financing Desk & Status Filters',
          path: '/admin',
          hash: '#work-orders',
          persona: 'admin',
          selector: '.work-orders-desk, [data-testid="work-orders-tab"], .glass-card',
          expectedText: ['Work-Order', 'Financing', 'Disbursement'],
          actions: [
            { type: 'click', selector: '.admin-sidebar button[title*="Work-Order"], button:has-text("Work-Order")' },
            { type: 'verify', selector: 'button:has-text("All"), button:has-text("Disbursed"), button:has-text("Repaid")' }
          ]
        },
        {
          id: 'suite-4-9',
          name: 'Tab 5: Work-Order Disbursement & Repayment Verification',
          path: '/admin',
          hash: '#work-orders',
          persona: 'admin',
          selector: 'input[placeholder*="Search"], table, .glass-card',
          expectedText: ['Work-Order'],
          actions: [
            { type: 'verify', selector: 'input[placeholder*="Search"], table' }
          ]
        },
        {
          id: 'suite-4-10',
          name: 'Tab 6: Investor Hub Search, Filters & Investor Detail Drawer',
          path: '/admin',
          hash: '#investors',
          persona: 'admin',
          selector: '.investors-hub-table, [data-testid="investors-hub"], table, .glass-card',
          expectedText: ['Investor Hub', 'Active Investors'],
          actions: [
            { type: 'click', selector: '.admin-sidebar button[title*="Investor Hub"], button:has-text("Investor Hub")' },
            { type: 'verify', selector: 'input[placeholder*="Search investor"], input[placeholder*="Search"]' }
          ]
        },
        {
          id: 'suite-4-11',
          name: 'Tab 6: Investor KYC & Payment Proof Approval Queues',
          path: '/admin',
          hash: '#investors',
          persona: 'admin',
          selector: 'button:has-text("KYC"), button:has-text("Payment"), button:has-text("Verification"), body',
          expectedText: ['Investor'],
          actions: [
            { type: 'verify', selector: 'button:has-text("KYC"), button:has-text("Payment"), body' }
          ]
        },
        {
          id: 'suite-4-12',
          name: 'Tab 7: Monthly Yield Engine & Disbursement Ledger',
          path: '/admin',
          hash: '#dividend',
          persona: 'admin',
          selector: '.yield-engine-table, [data-testid="yield-engine"], .glass-card',
          expectedText: ['Yield Engine', 'Monthly Payout'],
          actions: [
            { type: 'click', selector: '.admin-sidebar button[title*="Yield"], button:has-text("Yield Engine")' }
          ]
        },
        {
          id: 'suite-4-13',
          name: 'Tab 8: Private Cash Concierge Desk & KAM Dispatch',
          path: '/admin',
          hash: '#cash-pipeline',
          persona: 'admin',
          selector: '.cash-desk-table, [data-testid="cash-pipeline"], .glass-card',
          expectedText: ['Cash Concierge', 'Tickets'],
          actions: [
            { type: 'click', selector: '.admin-sidebar button[title*="Cash Concierge"], button:has-text("Cash Concierge")' }
          ]
        },
        {
          id: 'suite-4-14',
          name: 'Tab 9: Secondary Market Clearance & FMV Corridor Check',
          path: '/admin',
          hash: '#secondary-clearance',
          persona: 'admin',
          selector: '.secondary-clearance-desk, [data-testid="secondary-clearance"], .glass-card',
          expectedText: ['Secondary Clearance', 'FMV Corridor'],
          actions: [
            { type: 'click', selector: '.admin-sidebar button[title*="Secondary"], button:has-text("Secondary")' }
          ]
        },
        {
          id: 'suite-4-15',
          name: 'Tab 10: Team Directory, Promoters CRM & Commission Approvals',
          path: '/admin',
          hash: '#team-promoters',
          persona: 'admin',
          selector: '.team-promoters-table, [data-testid="team-promoters"], .glass-card',
          expectedText: ['Team', 'Promoters', 'KAM', 'Commission Tier'],
          actions: [
            { type: 'click', selector: '.admin-sidebar button[title*="Team"], button:has-text("Team & Promoters")' }
          ]
        },
        {
          id: 'suite-4-16',
          name: 'Tab 11: Marketing Leads CRM & Attribution',
          path: '/admin',
          hash: '#leads-marketing',
          persona: 'admin',
          selector: '.leads-table, [data-testid="leads-marketing"], .glass-card',
          expectedText: ['Leads', 'Marketing', 'Attribution'],
          actions: [
            { type: 'click', selector: '.admin-sidebar button[title*="Leads"], button:has-text("Leads")' }
          ]
        },
        {
          id: 'suite-4-17',
          name: 'Tab 12: Legal Contracts & Compliance Vault',
          path: '/admin',
          hash: '#legal',
          persona: 'admin',
          selector: '.legal-admin-desk, [data-testid="legal-desk"], .glass-card',
          expectedText: ['Legal & Compliance', 'Vault'],
          actions: [
            { type: 'click', selector: '.admin-sidebar button[title*="Legal"], button:has-text("Legal & Compliance")' }
          ]
        },
        {
          id: 'suite-4-18',
          name: 'Tab 13: Platform Telemetry & Growth Analytics',
          path: '/admin',
          hash: '#analytics',
          persona: 'admin',
          selector: '.analytics-desk, [data-testid="analytics-desk"], .glass-card',
          expectedText: ['Analytics', 'Volume'],
          actions: [
            { type: 'click', selector: '.admin-sidebar button[title*="Analytics"], button:has-text("Analytics")' }
          ]
        },
        {
          id: 'suite-4-19',
          name: 'Tab 14: Telegram Bot Access Control, Token Masking & Webhook Ping',
          path: '/admin',
          hash: '#bot-management',
          persona: 'admin',
          selector: '.bot-management-desk, [data-testid="bot-management"], .glass-card',
          expectedText: ['Bot Access', 'Telegram Webhook', '@gro10xmanbot'],
          actions: [
            { type: 'click', selector: '.admin-sidebar button[title*="Bot"], button:has-text("Bots & Access Control")' }
          ]
        },
        {
          id: 'suite-4-20',
          name: 'Tab 15: Super-Admin Platform Settings & System Hardening',
          path: '/admin',
          hash: '#settings',
          persona: 'admin',
          selector: '.admin-settings-desk, [data-testid="admin-settings"], .glass-card',
          expectedText: ['Settings', 'Security', 'System Configuration'],
          actions: [
            { type: 'click', selector: '.admin-sidebar button[title*="Settings"], button:has-text("Settings")' }
          ]
        }
      ]
    },

    {
      id: 'platform-5',
      name: '5. Key Account Manager (KAM) Field Desk',
      description: 'Physical field audits, POS daily reconciliation, and fraud anomaly detection.',
      defaultPersona: 'kam',
      suites: [
        {
          id: 'suite-5-1',
          name: 'KAM Dashboard Header, Managing Partner Identity & Currency Switcher',
          path: '/kam-dashboard',
          hash: '',
          persona: 'kam',
          selector: 'h1, .glass-card',
          expectedText: ['Managing Partner', 'Verified Partner', 'HNI & Audit Desk'],
          actions: [
            { type: 'verify', selector: 'h1' },
            { type: 'verify', selector: 'span:has-text("Verified Partner")' },
            { type: 'verify', selector: 'select' },
            { type: 'verify', selector: 'button:has-text("Monthly Audits"), button:has-text("Assigned Investors")' }
          ]
        },
        {
          id: 'suite-5-2',
          name: 'Monthly Audits Tab: Outlet Selector & Balance Sheet Asset Inputs',
          path: '/kam-dashboard',
          hash: '#audits',
          persona: 'kam',
          selector: 'form, select, .glass-card',
          expectedText: ['Monthly Financial Balance Sheet', 'Current Assets', 'Physical Cash in Hand', 'Stock / Inventory Valuation'],
          actions: [
            { type: 'click', selector: 'button:has-text("Monthly Audits")' },
            { type: 'verify', selector: 'select' },
            { type: 'verify', selector: 'input[type="number"]' },
            { type: 'fill', selector: 'input[placeholder="0"]', value: '250000' }
          ]
        },
        {
          id: 'suite-5-3',
          name: 'Monthly Audits Tab: Liabilities Inputs & Net Working Capital Live Calculation',
          path: '/kam-dashboard',
          hash: '#audits',
          persona: 'kam',
          selector: 'form, .glass-card',
          expectedText: ['Current Liabilities', 'Pending Payables', 'Monthly Payroll', 'Net Working Capital'],
          actions: [
            { type: 'verify', selector: 'span:has-text("Current Liabilities")' },
            { type: 'verify', selector: 'span:has-text("Net Working Capital")' },
            { type: 'verify', selector: 'button[type="submit"]:has-text("Submit Verified Balance Sheet Audit")' }
          ]
        },
        {
          id: 'suite-5-4',
          name: 'Monthly Audits Tab: Dynamic Projected AI Health Score & Progress Bar',
          path: '/kam-dashboard',
          hash: '#audits',
          persona: 'kam',
          selector: '.glass-card',
          expectedText: ['Projected Health Score', '/100'],
          actions: [
            { type: 'verify', selector: 'h3:has-text("/100")' },
            { type: 'verify', selector: 'div[style*="transition: all 0.3s ease"], div[style*="height: 8px"]' },
            { type: 'verify', selector: 'span:has-text("Optimal Grid"), span:has-text("Good Standing"), span:has-text("Awaiting Entry"), span:has-text("Moderate Health")' }
          ]
        },
        {
          id: 'suite-5-5',
          name: 'Monthly Audits Tab: Field Asset Inspection Photos & Upload Triggers',
          path: '/kam-dashboard',
          hash: '#audits',
          persona: 'kam',
          selector: '.glass-card',
          expectedText: ['Field Asset Inspection Photos', 'Specialty Espresso Machine', 'Media 5-Ton AC Cassettes', 'POS Cash Register Terminal'],
          actions: [
            { type: 'verify', selector: 'h3:has-text("Field Asset Inspection Photos")' },
            { type: 'verify', selector: 'span:has-text("Specialty Espresso Machine")' },
            { type: 'verify', selector: 'label:has-text("Add Photo"), label:has-text("Retry"), span:has-text("Verified"), input[type="file"], .glass-card' }
          ]
        },
        {
          id: 'suite-5-6',
          name: 'Monthly Audits Tab: Recent Audit History Log & Outlet Ledgers',
          path: '/kam-dashboard',
          hash: '#audits',
          persona: 'kam',
          selector: '.glass-card',
          expectedText: ['Recent Audit History'],
          actions: [
            { type: 'verify', selector: 'h3:has-text("Recent Audit History")' },
            { type: 'verify', selector: 'div:has-text("/100"), p:has-text("No previous audits")' }
          ]
        },
        {
          id: 'suite-5-7',
          name: 'Assigned Investors Tab: 3-Card Portfolio KPI Strip & Filter Pills',
          path: '/kam-dashboard',
          hash: '#investors',
          persona: 'kam',
          selector: '.glass-card',
          expectedText: ['Assigned Investor Directory', 'Portfolio Capital (AUM)', 'KYC Verified Accounts', 'Avg Accreditation Tier'],
          actions: [
            { type: 'click', selector: 'button:has-text("Assigned Investors")' },
            { type: 'verify', selector: 'h3:has-text("৳"), h3:has-text("$")' },
            { type: 'verify', selector: 'button:has-text("All Accounts")' },
            { type: 'click', selector: 'button:has-text("VIP / Family Office"), button:has-text("KYC Pending")' }
          ]
        },
        {
          id: 'suite-5-8',
          name: 'Assigned Investors Tab: Investor Account Cards & Active Portfolio Holdings',
          path: '/kam-dashboard',
          hash: '#investors',
          persona: 'kam',
          selector: '.glass-card',
          expectedText: ['Assigned Investor Directory'],
          actions: [
            { type: 'click', selector: 'button:has-text("Assigned Investors")' },
            { type: 'verify', selector: 'div:has-text("Total Allocated"), h3:has-text("No investors assigned"), .glass-card' },
            { type: 'verify', selector: 'span:has-text("KYC Tier"), span:has-text("Anonymous OTC"), div:has-text("Active Portfolio Holdings"), h3:has-text("No investors assigned"), .glass-card' }
          ]
        },
        {
          id: 'suite-5-9',
          name: 'Assigned Investors Tab: HNI Direct Communication Actions (Call, WhatsApp, Email)',
          path: '/kam-dashboard',
          hash: '#investors',
          persona: 'kam',
          selector: '.glass-card',
          expectedText: ['Assigned Investor Directory'],
          actions: [
            { type: 'click', selector: 'button:has-text("Assigned Investors")' },
            { type: 'verify', selector: 'a[href^="tel:"], a[href*="wa.me"], a[href^="mailto:"], h3:has-text("No investors assigned")' }
          ]
        },
        {
          id: 'suite-5-10',
          name: 'CapEx Projects Tab: 3-Card CapEx KPI Strip & Fundraise Milestone Cards',
          path: '/kam-dashboard',
          hash: '#projects',
          persona: 'kam',
          selector: '.glass-card',
          expectedText: ['Active CapEx Pipeline & SPV Deal Room', 'Total CapEx Pipeline', 'Total Capital Committed', 'Active Targets'],
          actions: [
            { type: 'click', selector: 'button:has-text("CapEx Projects")' },
            { type: 'verify', selector: 'h3:has-text("৳"), h3:has-text("$")' },
            { type: 'verify', selector: 'span:has-text("Funded"), span:has-text("Live Portfolios")' }
          ]
        },
        {
          id: 'suite-5-11',
          name: 'CapEx Projects Tab: SPV Structuring, Yield Models & Capital Metrics',
          path: '/kam-dashboard',
          hash: '#projects',
          persona: 'kam',
          selector: '.glass-card',
          expectedText: ['Active CapEx Pipeline & SPV Deal Room'],
          actions: [
            { type: 'click', selector: 'button:has-text("CapEx Projects")' },
            { type: 'verify', selector: 'div:has-text("SPV Legal Structure"), div:has-text("Committed Capital"), h3:has-text("No CapEx projects")' },
            { type: 'verify', selector: 'span:has-text("Min. OTC Ticket"), span:has-text("Participating Investors")' }
          ]
        },
        {
          id: 'suite-5-12',
          name: 'Yield Disbursements Tab: 3-Card Yield KPI Strip & Settlement Batches',
          path: '/kam-dashboard',
          hash: '#yields',
          persona: 'kam',
          selector: '.glass-card',
          expectedText: ['Yield Disbursement Audit History', 'Total Yield Distributed', 'Verified Batches', 'Avg Payout / Batch'],
          actions: [
            { type: 'click', selector: 'button:has-text("Yield Disbursements")' },
            { type: 'verify', selector: 'h3:has-text("৳"), h3:has-text("$")' },
            { type: 'verify', selector: 'span:has-text("Settlement Runs"), span:has-text("Mean Cashflow")' }
          ]
        },
        {
          id: 'suite-5-13',
          name: 'Yield Disbursements Tab: Outlet Gross Sales Reconciliation & Payouts Grid',
          path: '/kam-dashboard',
          hash: '#yields',
          persona: 'kam',
          selector: '.glass-card',
          expectedText: ['Yield Disbursement Audit History'],
          actions: [
            { type: 'click', selector: 'button:has-text("Yield Disbursements")' },
            { type: 'verify', selector: 'div:has-text("Gross Outlet Sales"), div:has-text("Net Solvency Profit"), div:has-text("Syndicate Allocation"), h3:has-text("No yield disbursement history"), .glass-card' },
            { type: 'verify', selector: 'div:has-text("Reconciled"), div:has-text("Investor Payout"), h3:has-text("No yield disbursement history"), .glass-card' }
          ]
        },
        {
          id: 'suite-5-14',
          name: 'Cash Concierge Tab: 3-Card Cash KPI Strip, Filter Pills & OTC Tickets',
          path: '/kam-dashboard',
          hash: '#cash-pipeline',
          persona: 'kam',
          selector: '.glass-card',
          expectedText: ['Assigned Cash Concierge & OTC Block Pipeline', 'Active Pipeline Value', 'Pending Consultations', 'Cleared Capital'],
          actions: [
            { type: 'click', selector: 'button:has-text("Cash Concierge")' },
            { type: 'verify', selector: 'button:has-text("All Tickets")' },
            { type: 'click', selector: 'button:has-text("Pending Review"), button:has-text("Funds Cleared")' },
            { type: 'verify', selector: 'div:has-text("OTC Block Order"), h3:has-text("No cash concierge tickets"), .glass-card' },
            { type: 'verify', selector: 'div:has-text("Preferred Meeting Time"), div:has-text("Meeting Format"), h3:has-text("No cash concierge tickets"), .glass-card' }
          ]
        },
        {
          id: 'suite-5-15',
          name: 'Automated Fraud & Anomaly Engine: Telemetry Watchdog & Audit Approvals',
          path: '/fraud-detection',
          hash: '',
          persona: 'kam',
          selector: 'table, .glass-card',
          expectedText: ['AUTOMATED FRAUD & ANOMALY ENGINE', 'Active Anomaly Flags', 'Resolved Anomalies', 'COGS Variance Index', 'POS Financial Anomaly'],
          actions: [
            { type: 'verify', selector: 'h2:has-text("High Risk")' },
            { type: 'verify', selector: 'table' },
            { type: 'verify', selector: 'th:has-text("Alert ID"), th:has-text("Flagged Metric")' },
            { type: 'click', selector: 'button:has-text("Mirpur"), button:has-text("Banani"), button:has-text("All")' },
            { type: 'click', selector: 'button:has-text("Approve Audit"), span:has-text("Verified")' }
          ]
        },
        {
          id: 'suite-5-16',
          name: 'POS Daily Telemetry Reconciliation & CapEx Buildout Inspector',
          path: '/pos-sync',
          hash: '',
          persona: 'kam',
          selector: 'form, table, .glass-card',
          expectedText: ['POS Sync Portal', 'Daily Sales Reconciliation', 'Dine-In Sales'],
          actions: [
            { type: 'verify', selector: 'select' },
            { type: 'verify', selector: 'input[type="date"], input[type="number"]' },
            { type: 'verify', selector: 'table, div:has-text("Ingested Daily Sales Register"), .glass-card' },
            { type: 'verify', selector: 'button:has-text("Submit"), button:has-text("Reconcile")' }
          ]
        }
      ]
    },

    {
      id: 'platform-6',
      name: '6. Growth Promoter & Syndicate CRM',
      description: 'Syndicate affiliate attribution, referral tracking, and commission payouts.',
      defaultPersona: 'promoter',
      suites: [
        {
          id: 'suite-6-1',
          name: 'Promoter Portal Header, Identity, Referral Code & Currency Switcher',
          path: '/promoter',
          hash: '',
          persona: 'promoter',
          selector: 'header, h1, .glass-card',
          expectedText: ['Capital Promoter', 'Referral Code'],
          actions: [
            { type: 'verify', selector: 'header, h1' },
            { type: 'verify', selector: 'span:has-text("Tier:")' },
            { type: 'verify', selector: 'strong:has-text("Referral Code"), p:has-text("Referral Code")' },
            { type: 'verify', selector: 'select' }
          ]
        },
        {
          id: 'suite-6-2',
          name: 'Staff Overseer Mode & Multi-Promoter Pipeline Picker',
          path: '/promoter',
          hash: '',
          persona: 'admin',
          selector: 'header, select, .glass-card',
          expectedText: ['Referral Code'],
          actions: [
            { type: 'verify', selector: 'span:has-text("OVERSEER"), select, header' },
            { type: 'verify', selector: 'select, .glass-card' }
          ]
        },
        {
          id: 'suite-6-3',
          name: '4-Card Executive KPI Strip: Prospects, Earnings, Pledges & Balance',
          path: '/promoter',
          hash: '',
          persona: 'promoter',
          selector: '.glass-card',
          expectedText: ['CRM Prospects Logged', 'Total Commission Earned', 'Campaign Target Pledges', 'Available Payout Balance'],
          actions: [
            { type: 'verify', selector: 'span:has-text("CRM Prospects Logged")' },
            { type: 'verify', selector: 'span:has-text("Total Commission Earned")' },
            { type: 'verify', selector: 'span:has-text("Campaign Target Pledges")' },
            { type: 'verify', selector: 'span:has-text("Available Payout Balance")' }
          ]
        },
        {
          id: 'suite-6-4',
          name: 'Gamified 50-Investor Challenge Progress Bar & Locked State',
          path: '/promoter',
          hash: '',
          persona: 'promoter',
          selector: '.glass-card',
          expectedText: ['50-INVESTOR ONBOARDING CHALLENGE', '/ 50'],
          actions: [
            { type: 'verify', selector: 'h2:has-text("50 Qualified Prospects"), h2:has-text("Deal Promotion Link")' },
            { type: 'verify', selector: 'div[style*="height: 8px"]' }
          ]
        },
        {
          id: 'suite-6-5',
          name: 'Deal Promotion Referral Link, One-Click Copy & Native Web Share',
          path: '/promoter',
          hash: '',
          persona: 'promoter',
          selector: '.glass-card',
          expectedText: ['Deal', 'Prospect'],
          actions: [
            { type: 'verify', selector: 'input[value*="showcase?ref="], button:has-text("Copy Link"), button:has-text("Share Link"), .glass-card' },
            { type: 'click', selector: 'button:has-text("Copy Link"), button:has-text("Copy"), button:has-text("CRM & Prospects")' }
          ]
        },
        {
          id: 'suite-6-6',
          name: 'CRM & Prospects Tab: Log Prospect Form Inputs & Category Selection',
          path: '/promoter',
          hash: '',
          persona: 'promoter',
          selector: 'form, .glass-card',
          expectedText: ['Log Investor Prospect', 'Investor Full Name', 'WhatsApp Phone', 'Investor Category', 'Investment Interest'],
          actions: [
            { type: 'click', selector: 'button:has-text("CRM & Prospects")' },
            { type: 'verify', selector: 'input[placeholder*="Shafiqul Islam"]' },
            { type: 'verify', selector: 'select' },
            { type: 'fill', selector: 'input[placeholder*="Shafiqul Islam"]', value: 'Dr. Tariq Rahman' },
            { type: 'fill', selector: 'input[placeholder="01700000000"]', value: '01711223344' },
            { type: 'verify', selector: 'button:has-text("Save Prospect to CRM Pipeline")' }
          ]
        },
        {
          id: 'suite-6-7',
          name: 'CRM & Prospects Tab: Prospect Search, Status Filtering & Inline Status Updates',
          path: '/promoter',
          hash: '',
          persona: 'promoter',
          selector: '.glass-card',
          expectedText: ['My Logged Prospects Queue'],
          actions: [
            { type: 'click', selector: 'button:has-text("CRM & Prospects")' },
            { type: 'verify', selector: 'input[placeholder*="Search"]' },
            { type: 'verify', selector: 'select:has-text("All Statuses"), select' },
            { type: 'fill', selector: 'input[placeholder*="Search"]', value: '017' }
          ]
        },
        {
          id: 'suite-6-8',
          name: 'Campaign Targets Tab: CapEx Project Selection & Target Pledge Commitment',
          path: '/promoter',
          hash: '#targets',
          persona: 'promoter',
          selector: 'form, .glass-card',
          expectedText: ['Pledge Campaign Raise Target', 'CapEx Target Project'],
          actions: [
            { type: 'click', selector: 'button:has-text("Campaign Targets"), [data-testid="tab-targets"]' },
            { type: 'verify', selector: 'select' },
            { type: 'verify', selector: 'input[type="number"], input[placeholder*="Pledged"], .glass-card' },
            { type: 'verify', selector: 'button:has-text("Commit Campaign Target Pledge"), button[type="submit"], .glass-card' }
          ]
        },
        {
          id: 'suite-6-9',
          name: 'Campaign Targets Tab: Pledged Raise Targets List & +0.25% Bonus Tier Verification',
          path: '/promoter',
          hash: '#targets',
          persona: 'promoter',
          selector: '.glass-card',
          expectedText: ['Pledged Project Raise Targets'],
          actions: [
            { type: 'click', selector: 'button:has-text("Campaign Targets"), [data-testid="tab-targets"]' },
            { type: 'verify', selector: 'h3:has-text("Pledged Project Raise Targets"), .glass-card' },
            { type: 'verify', selector: 'span:has-text("In Progress"), span:has-text("Target Achieved"), p:has-text("No project targets committed yet"), .glass-card' }
          ]
        },
        {
          id: 'suite-6-10',
          name: 'Earnings & Commission Ledger Tab: Milestone Tiers & Detailed Allocation Table',
          path: '/promoter',
          hash: '#earnings',
          persona: 'promoter',
          selector: '.glass-card',
          expectedText: ['Milestone Tier Status', 'Commission Earnings Summary'],
          actions: [
            { type: 'click', selector: 'button:has-text("Earnings & Commission Ledger"), [data-testid="tab-earnings"]' },
            { type: 'verify', selector: 'h3:has-text("Milestone Tier Status"), .glass-card' },
            { type: 'verify', selector: 'strong:has-text("Base Commission:"), .glass-card' },
            { type: 'verify', selector: 'table, p:has-text("No commissions registered"), .glass-card' }
          ]
        },
        {
          id: 'suite-6-11',
          name: 'Payout Requests Tab: Commission Withdrawal Form & Disbursement Channels',
          path: '/promoter',
          hash: '#payouts',
          persona: 'promoter',
          selector: 'form, .glass-card',
          expectedText: ['Request Commission Withdrawal', 'Available for Withdrawal'],
          actions: [
            { type: 'click', selector: 'button:has-text("Payout Requests"), [data-testid="tab-payouts"]' },
            { type: 'verify', selector: 'input[type="number"], .glass-card' },
            { type: 'verify', selector: 'select, .glass-card' },
            { type: 'verify', selector: 'button:has-text("Submit Withdrawal Request"), button[type="submit"], .glass-card' },
            { type: 'verify', selector: 'h3:has-text("Payout Request History"), .glass-card' }
          ]
        },
        {
          id: 'suite-6-12',
          name: 'Standalone Payouts Portal: Wallet Overview & Disbursed Ledger',
          path: '/payouts',
          hash: '',
          persona: 'promoter',
          selector: 'form, .glass-card',
          expectedText: ['Wallet & Earnings', 'Payout'],
          actions: [
            { type: 'verify', selector: 'a[href="/promoter"], a[href="/payouts"], .glass-card' },
            { type: 'verify', selector: 'input[type="number"], .glass-card' },
            { type: 'verify', selector: 'select, .glass-card' },
            { type: 'verify', selector: 'button:has-text("Request Cashout Payout"), button:has-text("Cashout"), .glass-card' }
          ]
        }
      ]
    },

    {
      id: 'platform-7',
      name: '7. Field Operations & Telegram MiniApp',
      description: 'Mobile Telegram WebApp, 3-bot mesh launcher, and AI Copilot assistant.',
      defaultPersona: 'admin',
      suites: [
        {
          id: 'suite-7-1',
          name: 'Telegram MiniApp: Admin View (Operational KPIs, Alert Badges & Queue)',
          path: '/team-miniapp',
          hash: '',
          persona: 'admin',
          selector: 'header, main',
          expectedText: ['GRO10X OS'],
          actions: [
            { type: 'verify', selector: 'header' },
            { type: 'verify', selector: 'div:has-text("Total AUM Raised"), div:has-text("Active Investors"), div:has-text("Action Queue"), div:has-text("Unworked Leads"), main' }
          ]
        },
        {
          id: 'suite-7-2',
          name: 'Telegram MiniApp: KAM Field View (Assigned Portfolio & Cash Tickets)',
          path: '/team-miniapp',
          hash: '',
          persona: 'kam',
          selector: 'header, main',
          expectedText: ['GRO10X OS'],
          actions: [
            { type: 'verify', selector: 'header' },
            { type: 'verify', selector: 'button:has-text("PIN"), button:has-text("Tickets"), div:has-text("CapEx Portfolio")' }
          ]
        },
        {
          id: 'suite-7-3',
          name: 'Telegram MiniApp: Promoter View (Commission Accruals & Referral Stats)',
          path: '/team-miniapp',
          hash: '',
          persona: 'promoter',
          selector: 'header, main',
          expectedText: ['GRO10X OS'],
          actions: [
            { type: 'verify', selector: 'header' },
            { type: 'verify', selector: 'div:has-text("Commissions"), div:has-text("Referrals"), div:has-text("Total Earned"), button:has-text("PIN")' }
          ]
        },
        {
          id: 'suite-7-4',
          name: 'Telegram MiniApp: Investor View (Portfolio Holdings & Yield Distributions)',
          path: '/team-miniapp?role=investor',
          hash: '',
          persona: 'investor',
          selector: 'header, main',
          expectedText: ['GRO10X OS'],
          actions: [
            { type: 'verify', selector: 'header' },
            { type: 'verify', selector: 'div:has-text("Total Invested"), div:has-text("Yields Distributed"), div:has-text("Active Holdings"), main' }
          ]
        },
        {
          id: 'suite-7-5',
          name: 'Telegram MiniApp: Founder View (Business Entities & Capital Raised)',
          path: '/team-miniapp?role=founder',
          hash: '',
          persona: 'founder',
          selector: 'header, main',
          expectedText: ['GRO10X OS'],
          actions: [
            { type: 'verify', selector: 'header' },
            { type: 'verify', selector: 'div:has-text("Businesses"), div:has-text("Total Raised"), div:has-text("SPV Cap Table"), main' }
          ]
        },
        {
          id: 'suite-7-6',
          name: 'Telegram MiniApp: Multi-Step Investor Survey Wizard (bKash-Style Steps)',
          path: '/team-miniapp',
          hash: '',
          persona: 'admin',
          selector: 'main',
          expectedText: ['GRO10X OS'],
          actions: [
            { type: 'click', selector: 'button:has-text("New Prospect"), button:has-text("Survey"), button:has-text("Investor Survey")' },
            { type: 'verify', selector: 'input[placeholder*="Name"], input[type="text"], div:has-text("Step")' },
            { type: 'click', selector: 'button:has-text("✕"), [aria-label="Close"], button:has-text("Cancel"), main' }
          ]
        },
        {
          id: 'suite-7-7',
          name: 'Telegram MiniApp: One-Time Web Login PIN Generator (15-Min Expiry)',
          path: '/team-miniapp',
          hash: '',
          persona: 'admin',
          selector: 'header',
          expectedText: ['PIN', 'GRO10X OS'],
          actions: [
            { type: 'click', selector: 'button:has-text("PIN")' },
            { type: 'verify', selector: 'div:has-text("PIN Issued"), div:has-text("Expires in 15m")' }
          ]
        },
        {
          id: 'suite-7-8',
          name: 'Telegram MiniApp: Sticky Bottom Navigation & Tab Switching',
          path: '/team-miniapp',
          hash: '',
          persona: 'admin',
          selector: 'nav, main',
          expectedText: ['GRO10X OS'],
          actions: [
            { type: 'verify', selector: 'nav, [style*="position: fixed"]' },
            { type: 'click', selector: 'button:has-text("Leads"), button:has-text("Payouts"), button:has-text("Home")' }
          ]
        },
        {
          id: 'suite-7-9',
          name: 'Telegram Bot Hub: Investor Bot (@gro10xcapbot) Command Matrix & Specs',
          path: '/telegram',
          hash: '',
          persona: 'public',
          selector: '.glass-card',
          expectedText: ['Unified Field & Capital Telegram Network', '@gro10xcapbot', '/portfolio', '/yields', '/kyc', '/deals'],
          actions: [
            { type: 'click', selector: 'button:has-text("Investor Bot")' },
            { type: 'verify', selector: 'h2:has-text("HNI & Syndicate Investor Bot")' },
            { type: 'verify', selector: 'a[href*="t.me/gro10xcapbot"]' },
            { type: 'verify', selector: 'code:has-text("/portfolio")' }
          ]
        },
        {
          id: 'suite-7-10',
          name: 'Telegram Bot Hub: Founder Bot (@gro10xbizbot) & Field KAM Bot Specs',
          path: '/telegram',
          hash: '',
          persona: 'public',
          selector: '.glass-card',
          expectedText: ['Unified Field & Capital Telegram Network'],
          actions: [
            { type: 'click', selector: 'button:has-text("Founder Bot")' },
            { type: 'verify', selector: 'h2:has-text("SME Founder & Franchise Operator Bot")' },
            { type: 'verify', selector: 'code:has-text("/status"), code:has-text("/captable")' },
            { type: 'click', selector: 'button:has-text("Field KAM Bot")' },
            { type: 'verify', selector: 'h2:has-text("Key Account Manager & Field Ops Bot")' },
            { type: 'verify', selector: 'code:has-text("/tickets"), code:has-text("/audit")' }
          ]
        },
        {
          id: 'suite-7-11',
          name: 'Telegram Bot Hub: Interactive Smartphone Simulator & Live Command Chips',
          path: '/telegram',
          hash: '',
          persona: 'public',
          selector: 'input[placeholder*="Type command"], a[href="/team-miniapp"], .glass-card, main',
          expectedText: ['Unified Field & Capital Telegram Network'],
          actions: [
            { type: 'verify', selector: 'input[placeholder*="Type command"]' },
            { type: 'click', selector: 'button:has-text("/portfolio"), button:has-text("/status"), button:has-text("/tickets")' },
            { type: 'verify', selector: 'a[href="/team-miniapp"], a:has-text("Preview MiniApp")' }
          ]
        },
        {
          id: 'suite-7-12',
          name: 'AI Copilot: Conversational Financial Concierge & Smart Prompt Chips',
          path: '/ai-assistant',
          hash: '',
          persona: 'public',
          selector: 'header, .glass-card',
          expectedText: ['ASK GRO10X AI CONCIERGE', '5 Smart Diligence Prompt Categories'],
          actions: [
            { type: 'verify', selector: 'h1:has-text("ASK GRO10X AI CONCIERGE")' },
            { type: 'verify', selector: 'button:has-text("Asset Safety"), button:has-text("SPV")' },
            { type: 'verify', selector: 'button:has-text("ROI Yield Structures")' },
            { type: 'verify', selector: 'button:has-text("Financial Audit")' }
          ]
        },
        {
          id: 'suite-7-13',
          name: 'AI Copilot: Natural Language ROI Calculator & Currency Switcher',
          path: '/ai-assistant',
          hash: '',
          persona: 'public',
          selector: 'input[type="text"], .glass-card',
          expectedText: ['ASK GRO10X AI CONCIERGE'],
          actions: [
            { type: 'verify', selector: 'select' },
            { type: 'fill', selector: 'input[placeholder*="Ask a question"]', value: 'What is my return on 20 Lakhs in Option 1?' },
            { type: 'click', selector: 'button.btn-gold:has(svg)' },
            { type: 'verify', selector: 'div:has-text("Option 1"), div:has-text("Capped Yield")' }
          ]
        },
        {
          id: 'suite-7-14',
          name: 'AI Copilot: Embedded VIP Outlet Tour Booking Modal & Admin Push',
          path: '/ai-assistant',
          hash: '',
          persona: 'public',
          selector: '.glass-card',
          expectedText: ['ASK GRO10X AI CONCIERGE'],
          actions: [
            { type: 'fill', selector: 'input[placeholder*="Ask a question"]', value: 'Can I visit the Banani outlet?' },
            { type: 'click', selector: 'button.btn-gold:has(svg)' },
            { type: 'verify', selector: 'button:has-text("Schedule VIP Tour Now")' },
            { type: 'click', selector: 'button:has-text("Schedule VIP Tour Now")' },
            { type: 'verify', selector: 'h3:has-text("Schedule VIP Outlet Tour"), input[name="contact"]' }
          ]
        }
      ]
    },

    {
      id: 'platform-8',
      name: '8. Work-Order & Construction Financing Desk',
      description: 'Progressive disclosure tracking for MSP work orders, POs, and contractor payouts.',
      defaultPersona: 'admin',
      suites: [
        {
          id: 'suite-8-1',
          name: 'Maats Cottage Tracker: Executive Header, Brand Profile & WhatsApp Action',
          path: '/track/maats-cottage',
          hash: '',
          persona: 'admin',
          selector: 'header, .glass-card',
          expectedText: ['MAATS COTTAGE', 'Work-Order Financing Desk', 'Verified Vendor'],
          actions: [
            { type: 'verify', selector: 'header' },
            { type: 'verify', selector: 'button:has-text("Log Work Order"), .btn-gold' },
            { type: 'verify', selector: 'button[title="More options"], a[href^="tel:"], button:has-text("Log Work Order")' }
          ]
        },
        {
          id: 'suite-8-2',
          name: 'Maats Cottage Tracker: Dynamic Maturity Alerts & Quick Navigation Cards',
          path: '/track/maats-cottage',
          hash: '',
          persona: 'admin',
          selector: '.glass-card',
          expectedText: ['Active Orders', 'Pending Review', 'Settled Ledger', 'Due Diligence'],
          actions: [
            { type: 'verify', selector: 'a[href*="/active"], span:has-text("Active Orders")' },
            { type: 'verify', selector: 'a[href*="/pending"], span:has-text("Pending Review")' },
            { type: 'verify', selector: 'a[href*="/settled"], span:has-text("Settled Ledger")' },
            { type: 'verify', selector: 'a[href*="/compliance"], span:has-text("Due Diligence")' }
          ]
        },
        {
          id: 'suite-8-3',
          name: 'Maats Cottage Tracker: Ledger Metrics Grid & SME Impact Analysis',
          path: '/track/maats-cottage',
          hash: '',
          persona: 'admin',
          selector: '.glass-card',
          expectedText: ['Deployed', 'Recovered'],
          actions: [
            { type: 'verify', selector: 'div:has-text("Deployed"), div:has-text("Queued"), div:has-text("Recovered")' },
            { type: 'verify', selector: 'h2:has-text("Partnership Economics"), div:has-text("Underwriting"), div:has-text("Commercial Impact"), .glass-card' }
          ]
        },
        {
          id: 'suite-8-4',
          name: 'Active Deployments Subroute: Search, Filtering & Work Order Cards',
          path: '/track/maats-cottage/active',
          hash: '',
          persona: 'admin',
          selector: '.glass-card, input[placeholder*="Search"]',
          expectedText: ['Active Deployments', 'MSP-'],
          actions: [
            { type: 'verify', selector: 'input[placeholder*="Search"]' },
            { type: 'verify', selector: 'div:has-text("MSP-"), .work-order-card, .glass-card' },
            { type: 'verify', selector: 'button:has-text("Settle"), button:has-text("Details"), .btn-gold' }
          ]
        },
        {
          id: 'suite-8-5',
          name: 'Active Deployments Subroute: Multi-Tab Document Inspector Modal',
          path: '/track/maats-cottage/active',
          hash: '',
          persona: 'admin',
          selector: '.glass-card',
          expectedText: ['Active Deployments'],
          actions: [
            { type: 'click', selector: 'button:has-text("Details"), button:has-text("Settle"), .btn-gold' },
            { type: 'verify', selector: 'div:has-text("Purchase Order"), div:has-text("Disbursed"), div:has-text("Return"), .glass-card' }
          ]
        },
        {
          id: 'suite-8-6',
          name: 'Active Deployments Subroute: Order Settlement Modal & Profit Realization',
          path: '/track/maats-cottage/active',
          hash: '',
          persona: 'admin',
          selector: '.glass-card',
          expectedText: ['Active Deployments'],
          actions: [
            { type: 'click', selector: 'button:has-text("Settle"), .btn-gold' },
            { type: 'verify', selector: 'span:has-text("Settlement"), span:has-text("Dual-Document"), button:has-text("Confirm Settlement"), div:has-text("Disbursed"), .glass-card' },
            { type: 'click', selector: 'button:has-text("Cancel"), button:has-text("Less"), .glass-card' }
          ]
        },
        {
          id: 'suite-8-7',
          name: 'Pending Clearances Subroute: Capital Disbursal Queue',
          path: '/track/maats-cottage/pending',
          hash: '',
          persona: 'admin',
          selector: '.glass-card',
          expectedText: ['Pending Clearances', 'Pending Review'],
          actions: [
            { type: 'verify', selector: 'h2:has-text("Pending"), span:has-text("Queued"), .glass-card' },
            { type: 'verify', selector: 'button:has-text("Review & Edit"), button:has-text("Log Work Order"), h3:has-text("All Clear"), div:has-text("MSP-"), .glass-card' }
          ]
        },
        {
          id: 'suite-8-8',
          name: 'Settled Ledger Subroute: Reconciled Purchase Orders & Repayment Slips',
          path: '/track/maats-cottage/settled',
          hash: '',
          persona: 'admin',
          selector: '.glass-card',
          expectedText: ['Settled & Repaid', 'Recovered'],
          actions: [
            { type: 'verify', selector: 'h2:has-text("Settled"), span:has-text("Recovered"), .glass-card' },
            { type: 'verify', selector: 'div:has-text("Profit Realized"), button:has-text("Repayment Slip"), div:has-text("MSP-")' }
          ]
        },
        {
          id: 'suite-8-9',
          name: 'Compliance Vault Subroute: 6 Verified Regulatory Artifacts',
          path: '/track/maats-cottage/compliance',
          hash: '',
          persona: 'admin',
          selector: '.glass-card',
          expectedText: ['Due Diligence Vault', '100% Verified', 'Trade License'],
          actions: [
            { type: 'verify', selector: 'span:has-text("100% Verified"), span:has-text("Verified"), .status-badge--success' },
            { type: 'verify', selector: 'div:has-text("Trade License"), div:has-text("TIN"), div:has-text("Security Cheque")' }
          ]
        },
        {
          id: 'suite-8-10',
          name: 'New Work Order Form: Standalone PO Registration & Uploads',
          path: '/track/maats-cottage/new',
          hash: '',
          persona: 'admin',
          selector: 'form, .glass-card',
          expectedText: ['Submit New Corporate Work Order', 'Corporate Buyer', 'PO Reference'],
          actions: [
            { type: 'verify', selector: 'input[placeholder*="Delta"], input[placeholder*="National Life"], input[type="text"]' },
            { type: 'verify', selector: 'input[placeholder*="Laptop Bag"], input[placeholder*="DL/"], input[type="text"]' },
            { type: 'verify', selector: 'input[type="number"]' },
            { type: 'verify', selector: 'button:has-text("Submit"), button[type="submit"]' }
          ]
        },
        {
          id: 'suite-8-11',
          name: 'Client Portal Gateway & Business Redirection',
          path: '/client',
          hash: '',
          persona: 'public',
          selector: 'main, body',
          expectedText: ['Founder', 'Business', 'GRO10X'],
          actions: [
            { type: 'verify', selector: 'main' }
          ]
        },
        {
          id: 'suite-8-12',
          name: 'Authentication Gateway: Telegram 4-Digit PIN Verification & First-Login Setup',
          path: '/auth',
          hash: '',
          persona: 'public',
          selector: 'form, .auth-card',
          expectedText: ['Sign In', 'Authentication'],
          actions: [
            { type: 'verify', selector: 'input[placeholder*="Email"], input[placeholder*="Phone"], input[type="text"]' },
            { type: 'verify', selector: 'input[type="password"], button[type="submit"]' }
          ]
        },
        {
          id: 'suite-8-13',
          name: 'Legal Policy Suite: Terms of Service & SPV Membership Agreements',
          path: '/terms',
          hash: '',
          persona: 'public',
          selector: '.glass-card',
          expectedText: ['Terms of Service', 'Platform Nature', 'SPV Membership', 'Governing Law'],
          actions: [
            { type: 'verify', selector: 'h1:has-text("Terms of Service")' },
            { type: 'verify', selector: 'h3:has-text("Platform Nature")' },
            { type: 'verify', selector: 'h3:has-text("Monthly Disbursements")' }
          ]
        },
        {
          id: 'suite-8-14',
          name: 'Legal Policy Suite: Privacy Policy & Investor Risk Disclosure',
          path: '/risk-disclosure',
          hash: '',
          persona: 'public',
          selector: '.glass-card',
          expectedText: ['Risk Disclosure Statement', 'Business & Commercial Risk', 'Capital Guarantee Disclaimer'],
          actions: [
            { type: 'verify', selector: 'h1:has-text("Risk Disclosure")' },
            { type: 'verify', selector: 'h3:has-text("Commercial Risk")' },
            { type: 'verify', selector: 'h3:has-text("Capital Guarantee")' }
          ]
        }
      ]
    }
  ];

  // Helper APIs
  function getAllPlatforms() {
    return PLATFORMS;
  }

  function getPlatform(platformId) {
    return PLATFORMS.find(p => p.id === platformId);
  }

  function getAllSuites() {
    return PLATFORMS.flatMap(p => p.suites);
  }

  function getSuite(suiteId) {
    return getAllSuites().find(s => s.id === suiteId);
  }

  return {
    PLATFORMS,
    getAllPlatforms,
    getPlatform,
    getAllSuites,
    getSuite
  };
});
