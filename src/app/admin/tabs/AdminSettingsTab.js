'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AdminSettingsTab({ addToast }) {
  const [telegramChatId, setTelegramChatId] = useState('');
  const [saving, setSaving] = useState(false);
  const [founderPhone, setFounderPhone] = useState('01708459008');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', 'owner_telegram_chat_id')
        .single();

      if (data) {
        setTelegramChatId(data.setting_value);
      }
    } catch (err) {
      // No owner Telegram Chat ID configured yet
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          setting_key: 'owner_telegram_chat_id',
          setting_value: telegramChatId.trim(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'setting_key' });

      if (error) throw error;
      addToast('Telegram Chat ID & System Settings saved successfully!', 'success');
    } catch (err) {
      addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.3rem', color: '#fff' }}>Platform & Governance Settings</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Configure founder ownership profiles, system integration tokens, and automated alert dispatchers.</p>
      </div>

      {/* FOUNDER PROFILE CARD */}
      <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #D4AF37', background: '#0f172a', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#D4AF37', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform Founder & Super Admin</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', margin: '0.2rem 0' }}>Firoz Uddin Ahmed</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Co-Founder & Managing Partner | Full Governance & System Control</p>
          </div>
          <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
            ✓ Verified Admin
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#070a14', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Primary Contact Phone</span>
            <strong style={{ color: '#fff' }}>+880 {founderPhone}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>Assigned Bot Channel</span>
            <strong style={{ color: '#D4AF37' }}>Team & Management Bot</strong>
          </div>
        </div>
      </div>

      {/* SETTINGS FORM */}
      <form onSubmit={handleSaveSettings} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', color: '#D4AF37', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Owner / Operational Team Telegram Chat ID</label>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.75rem 0', lineHeight: '1.4' }}>
            New leads captured by LeadBot on project pages will be dispatched to this Telegram Chat ID instantly.
          </p>
          <input
            type="text"
            placeholder="e.g. 123456789 or -100123456789"
            value={telegramChatId}
            onChange={(e) => setTelegramChatId(e.target.value)}
            className="form-input"
          />
        </div>

        <button type="submit" disabled={saving} className="btn-gold" style={{ justifyContent: 'center', padding: '0.8rem' }}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
