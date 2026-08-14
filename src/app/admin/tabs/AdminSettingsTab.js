'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Bell, Percent, Shield, Save, CheckCircle2, UserCheck, Phone, DollarSign, Sliders, Lock, Zap } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

/**
 * AdminSettingsTab Component (Tab 12)
 * Comprehensive Platform Governance & Configuration Hub.
 * Manages Platform Identity, Telegram Notification Channels, Financial Parameters,
 * and Security Controls.
 */
export default function AdminSettingsTab({ currency = 'BDT', addToast, logPlatformActivity, onSettingsUpdated }) {
  const [settings, setSettings] = useState({
    platform_legal_name: 'GRO10X Capital Limited',
    founder_phone: '01708459008',
    owner_telegram_chat_id: '',
    investment_alert_chat_id: '',
    yield_alert_chat_id: '',
    deal_spread_pct: '5',
    min_ticket_size_bdt: '100000',
    default_promoter_commission_pct: '2.0',
    pin_expiry_minutes: '15'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const loaded = {};
        data.forEach(item => {
          if (item.setting_key) {
            loaded[item.setting_key] = item.setting_value;
          }
        });
        setSettings(prev => ({ ...prev, ...loaded }));
      }
    } catch (err) {
      console.error('Error fetching platform settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const safeLogActivity = (title, message, type = 'info') => {
    if (typeof logPlatformActivity === 'function') {
      logPlatformActivity(title, message, type);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Upsert all settings as key-value pairs
      const updates = Object.entries(settings).map(([key, val]) => ({
        setting_key: key,
        setting_value: String(val ?? '').trim(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('platform_settings')
        .upsert(updates, { onConflict: 'setting_key' });

      if (error) throw error;

      addToast && addToast('✓ Platform settings saved & synced successfully!', 'success');
      safeLogActivity('Platform Settings Updated', 'Updated platform parameters, alert dispatchers, and security controls', 'info');

      if (typeof onSettingsUpdated === 'function') {
        onSettingsUpdated(settings);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      addToast && addToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.02em' }}>Platform Governance & System Settings</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.2rem 0 0 0' }}>Manage platform parameters, notification dispatchers, fee structures, and access policies.</p>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.3rem 0.7rem', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.25)', fontWeight: 'bold' }}>
          ✓ Live Database Connected
        </span>
      </div>

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* SECTION 1: PLATFORM & FOUNDER IDENTITY */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '4px solid #D4AF37' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <UserCheck size={20} style={{ color: '#D4AF37' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#fff', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Platform Founder & Corporate Identity</h3>
                <p style={{ color: '#64748b', fontSize: '0.72rem', margin: 0 }}>Super Admin credentials and registered legal entity name.</p>
              </div>
            </div>
            <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 'bold' }}>
              ✓ Verified Admin
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#070a14', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase' }}>Super Admin</span>
              <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Firoz Uddin Ahmed</strong>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.1rem' }}>Co-Founder & Managing Partner</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Bot Channel</span>
              <strong style={{ color: '#D4AF37', fontSize: '0.95rem' }}>Team & Management Bot</strong>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#10b981', marginTop: '0.1rem' }}>● Linked (@gro10xmanbot)</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                Primary Founder Contact Phone
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                <span style={{ padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: '0.8rem', borderRight: '1px solid rgba(255,255,255,0.08)' }}>+880</span>
                <input
                  type="text"
                  value={settings.founder_phone}
                  onChange={(e) => handleChange('founder_phone', e.target.value)}
                  placeholder="01708459008"
                  style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', padding: '0.6rem 0.75rem', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                Platform Legal Entity Name
              </label>
              <input
                type="text"
                value={settings.platform_legal_name}
                onChange={(e) => handleChange('platform_legal_name', e.target.value)}
                placeholder="GRO10X Capital Limited"
                className="form-input"
                style={{ fontSize: '0.85rem' }}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: TELEGRAM NOTIFICATION DISPATCHERS */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bell size={20} style={{ color: '#3b82f6' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#fff', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Automated Telegram Alert Dispatchers</h3>
              <p style={{ color: '#64748b', fontSize: '0.72rem', margin: 0 }}>Configure real-time Telegram Chat IDs for operations, leads, investments, and yield runs.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                Lead Capture & Inquiries Telegram Chat ID
              </label>
              <p style={{ color: '#64748b', fontSize: '0.72rem', margin: '0 0 0.4rem 0' }}>
                Incoming inquiries from project landing pages and the web lead bot will be dispatched here immediately.
              </p>
              <input
                type="text"
                value={settings.owner_telegram_chat_id}
                onChange={(e) => handleChange('owner_telegram_chat_id', e.target.value)}
                placeholder="e.g. 7754769807 or -1001234567890"
                className="form-input"
                style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                  Investment Bookings Alert Chat ID
                </label>
                <p style={{ color: '#64748b', fontSize: '0.72rem', margin: '0 0 0.4rem 0' }}>
                  Alerts whenever an investor commits capital or books a tranche.
                </p>
                <input
                  type="text"
                  value={settings.investment_alert_chat_id}
                  onChange={(e) => handleChange('investment_alert_chat_id', e.target.value)}
                  placeholder="e.g. 7754769807 (optional)"
                  className="form-input"
                  style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                  Yield Disbursement Run Alert Chat ID
                </label>
                <p style={{ color: '#64748b', fontSize: '0.72rem', margin: '0 0 0.4rem 0' }}>
                  Alerts on execution of monthly yield distribution batches.
                </p>
                <input
                  type="text"
                  value={settings.yield_alert_chat_id}
                  onChange={(e) => handleChange('yield_alert_chat_id', e.target.value)}
                  placeholder="e.g. 7754769807 (optional)"
                  className="form-input"
                  style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: FINANCIAL PARAMETERS & SPREAD */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Percent size={20} style={{ color: '#10b981' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#fff', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Financial Rules & Fee Parameters</h3>
              <p style={{ color: '#64748b', fontSize: '0.72rem', margin: 0 }}>Configure platform spread target, minimum investment ticket, and baseline promoter incentives.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                Deal Spread Target (%)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={settings.deal_spread_pct}
                  onChange={(e) => handleChange('deal_spread_pct', e.target.value)}
                  placeholder="5.0"
                  style={{ flex: 1, background: 'transparent', border: 'none', color: '#D4AF37', fontWeight: 'bold', padding: '0.6rem 0.75rem', fontSize: '0.9rem', outline: 'none' }}
                />
                <span style={{ padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>%</span>
              </div>
              <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', marginTop: '0.25rem' }}>Drives sidebar fee spread widget</span>
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                Min Ticket Size ({currency})
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                <span style={{ padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: '0.8rem', borderRight: '1px solid rgba(255,255,255,0.08)' }}>৳</span>
                <input
                  type="number"
                  step="10000"
                  min="0"
                  value={settings.min_ticket_size_bdt}
                  onChange={(e) => handleChange('min_ticket_size_bdt', e.target.value)}
                  placeholder="100000"
                  style={{ flex: 1, background: 'transparent', border: 'none', color: '#10b981', fontWeight: 'bold', padding: '0.6rem 0.75rem', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
              <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', marginTop: '0.25rem' }}>Baseline ticket per investor deal</span>
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                Default Promoter Fee (%)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={settings.default_promoter_commission_pct}
                  onChange={(e) => handleChange('default_promoter_commission_pct', e.target.value)}
                  placeholder="2.0"
                  style={{ flex: 1, background: 'transparent', border: 'none', color: '#8b5cf6', fontWeight: 'bold', padding: '0.6rem 0.75rem', fontSize: '0.9rem', outline: 'none' }}
                />
                <span style={{ padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>%</span>
              </div>
              <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', marginTop: '0.25rem' }}>Tier 1 promoter commission base</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: SECURITY & ACCESS POLICIES */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Shield size={20} style={{ color: '#8b5cf6' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#fff', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Security & Access Control Policies</h3>
              <p style={{ color: '#64748b', fontSize: '0.72rem', margin: 0 }}>Configure session lifetimes and authentication parameters for Telegram PIN verification.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                Telegram Temporary PIN Validity (Minutes)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.pin_expiry_minutes}
                  onChange={(e) => handleChange('pin_expiry_minutes', e.target.value)}
                  placeholder="15"
                  style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontWeight: 'bold', padding: '0.6rem 0.75rem', fontSize: '0.9rem', outline: 'none' }}
                />
                <span style={{ padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>Minutes</span>
              </div>
              <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', marginTop: '0.25rem' }}>Window before generated 4-digit PIN expires</span>
            </div>

            <div style={{ background: '#070a14', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#D4AF37', fontWeight: 'bold', fontSize: '0.8rem' }}>
                <Lock size={14} /> Multi-Role Access Control Enabled
              </div>
              <p style={{ color: '#64748b', fontSize: '0.7rem', margin: '0.2rem 0 0 0' }}>
                Direct web session issuance is restricted to verified Admin, KAM, Promoter, and Investor profiles linked via Telegram Bot.
              </p>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON BAR */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn-gold"
            style={{ padding: '0.75rem 2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
          >
            <Save size={16} />
            {saving ? 'Saving Platform Settings...' : 'Save Platform Settings'}
          </button>
        </div>

      </form>
    </div>
  );
}
