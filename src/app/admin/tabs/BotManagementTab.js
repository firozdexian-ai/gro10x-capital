'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function BotManagementTab({ currency, addToast }) {
  const [botSubTab, setBotSubTab] = useState('bots'); // 'bots' | 'directory' | 'pins' | 'commands'
  const [botConfigs, setBotConfigs] = useState([]);
  const [authPins, setAuthPins] = useState([]);
  const [allUsersDirectory, setAllUsersDirectory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bot Editing Form State
  const [editingBotKey, setEditingBotKey] = useState(null);
  const [botForm, setBotForm] = useState({
    bot_key: '', bot_name: '', bot_username: '', bot_token: '', webhook_url: '', mini_app_url: '', welcome_message: '', is_active: true
  });
  const [savingBot, setSavingBot] = useState(false);

  // PIN Generation State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinForm, setPinForm] = useState({ phone_number: '', user_role: 'investor', linked_name: '' });
  const [generatingPin, setGeneratingPin] = useState(false);

  // Filters
  const [dirSearch, setDirSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    fetchBotData();
  }, []);

  const fetchBotData = async () => {
    try {
      setLoading(true);

      // Fetch Bot Configs
      const { data: bData } = await supabase.from('bot_configurations').select('*').order('created_at', { ascending: true });
      if (bData && bData.length > 0) {
        setBotConfigs(bData);
      } else {
        // Fallback default 3-bot structure
        setBotConfigs([
          {
            bot_key: 'team_bot',
            bot_name: 'GRO10X Team & Management Bot',
            bot_username: '@gro10xmanbot',
            bot_token: '8824027905:AAF9bJSiq6_yGNhNZ1hVNNjyYDssHXKUIcE',
            mini_app_url: 'https://t.me/gro10xmanbot/app',
            webhook_url: 'https://gro10x.com/api/telegram-webhook?bot=team',
            is_active: true,
            welcome_message: 'Welcome to GRO10X Management Bot. Access your web panel PIN, lead alerts, and team notifications here.'
          },
          {
            bot_key: 'investor_bot',
            bot_name: 'GRO10X Capital Investor Bot',
            bot_username: '@gro10xcapbot',
            bot_token: '8706301575:AAEoke9ZgeFAMsJqbQY-z1e4zF4aQwTnFpc',
            mini_app_url: 'https://t.me/gro10xcapbot/app',
            webhook_url: 'https://gro10x.com/api/telegram-webhook?bot=investor',
            is_active: true,
            welcome_message: 'Welcome to GRO10X Capital! Check your portfolio, yield statements, or request a temporary web login PIN.'
          },
          {
            bot_key: 'client_bot',
            bot_name: 'GRO10X Business & Client Bot',
            bot_username: '@gro10xbizbot',
            bot_token: '8529005937:AAF5AE7oV2YDjH3IOGfGDtuyBSFSZcPMQvI',
            mini_app_url: 'https://t.me/gro10xbizbot/app',
            webhook_url: 'https://gro10x.com/api/telegram-webhook?bot=client',
            is_active: true,
            welcome_message: 'Welcome Business Founder! Log daily POS sales, upload audit documents, and request your web panel access PIN.'
          }
        ]);
      }

      // Fetch Telegram Auth PINs
      const { data: pData } = await supabase.from('telegram_auth_pins').select('*').order('created_at', { ascending: false });
      setAuthPins(pData || []);

      // Fetch Unified Users for Directory
      const { data: teamMembers } = await supabase.from('team').select('id, full_name, phone, email, team_type, designation, telegram_chat_id, user_id');
      const { data: invs } = await supabase.from('investors').select('id, alias_name, full_name, phone, telegram_chat_id');

      const directory = [
        ...(teamMembers || []).map(t => ({ 
          id: t.id, 
          name: t.full_name, 
          phone: t.phone || 'N/A', 
          email: t.email || 'N/A', 
          role: t.team_type, 
          designation: t.designation || 'Team Member',
          chat_id: t.telegram_chat_id || null, 
          verified: !!t.telegram_chat_id 
        })),
        ...(invs || []).map(i => ({ 
          id: i.id, 
          name: i.alias_name || i.full_name, 
          phone: i.phone || 'N/A', 
          email: 'N/A', 
          role: 'investor', 
          designation: 'Accredited Investor',
          chat_id: i.telegram_chat_id || null, 
          verified: !!i.telegram_chat_id 
        }))
      ];
      setAllUsersDirectory(directory);

    } catch (err) {
      console.error('Error fetching bot data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Register Webhook with Telegram API
  const handleRegisterWebhook = async (botKey) => {
    try {
      const res = await fetch('/api/admin/register-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot_key: botKey })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register webhook');
      addToast(`✓ Telegram Webhook registered for ${botKey}! Endpoint: ${data.webhookUrl}`, 'success');
    } catch (err) {
      addToast(err.message || 'Webhook registration failed', 'error');
    }
  };

  // Edit Bot Config
  const handleOpenEditBot = (bot) => {
    setEditingBotKey(bot.bot_key);
    setBotForm({
      bot_key: bot.bot_key,
      bot_name: bot.bot_name || '',
      bot_username: bot.bot_username || '',
      bot_token: bot.bot_token || '',
      webhook_url: bot.webhook_url || '',
      mini_app_url: bot.mini_app_url || '',
      welcome_message: bot.welcome_message || '',
      is_active: bot.is_active ?? true
    });
  };

  // Save Bot Config
  const handleSaveBotConfig = async (e) => {
    e.preventDefault();
    setSavingBot(true);
    try {
      const payload = {
        bot_key: botForm.bot_key,
        bot_name: botForm.bot_name,
        bot_username: botForm.bot_username,
        bot_token: botForm.bot_token,
        webhook_url: botForm.webhook_url,
        mini_app_url: botForm.mini_app_url,
        welcome_message: botForm.welcome_message,
        is_active: botForm.is_active,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('bot_configurations').upsert(payload, { onConflict: 'bot_key' });
      if (error) throw error;

      addToast(`Bot Configuration '${botForm.bot_name}' saved successfully!`, 'success');
      setEditingBotKey(null);
      fetchBotData();
    } catch (err) {
      addToast(err.message || 'Failed to save bot config', 'error');
    } finally {
      setSavingBot(false);
    }
  };

  // Generate Temporary PIN for User
  const handleGeneratePin = async (e) => {
    e.preventDefault();
    if (!pinForm.phone_number) {
      addToast('Phone number is required.', 'error');
      return;
    }
    setGeneratingPin(true);
    try {
      // 4-digit random PIN
      const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

      const payload = {
        phone_number: pinForm.phone_number,
        user_role: pinForm.user_role,
        temp_pin: generatedPin,
        pin_expires_at: expiresAt,
        is_verified: false
      };

      const { error } = await supabase.from('telegram_auth_pins').insert([payload]);
      if (error) throw error;

      addToast(`Temporary Access PIN (${generatedPin}) generated for ${pinForm.linked_name || pinForm.phone_number}! Active for 15 mins.`, 'success');
      setShowPinModal(false);
      setPinForm({ phone_number: '', user_role: 'investor', linked_name: '' });
      fetchBotData();
    } catch (err) {
      addToast(err.message || 'Failed to generate PIN', 'error');
    } finally {
      setGeneratingPin(false);
    }
  };

  // Filtered Users Directory
  const filteredUsers = allUsersDirectory.filter(u => {
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesSearch = !dirSearch || u.name.toLowerCase().includes(dirSearch.toLowerCase()) || u.phone.includes(dirSearch);
    return matchesRole && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 4-TILE HEADER KPI STRIP */}
      <div className="kpi-grid">
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Configured Telegram Bots</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', margin: 0 }}>3 Active Bots</h3>
          <span style={{ fontSize: '0.7rem', color: '#10b981' }}>● Team, Investor & Client Bots</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Telegram Linked Users</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>
            {allUsersDirectory.filter(u => u.verified).length}
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#3b82f6' }}>of {allUsersDirectory.length} total platform users</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Active Auth PINs</p>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#D4AF37', margin: 0 }}>
            {authPins.filter(p => new Date(p.pin_expires_at) > new Date()).length}
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#D4AF37' }}>Temporary 15-min Login PINs</span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>Management Bot Token</p>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981', margin: 0, fontFamily: 'monospace' }}>
            8824027905:...
          </h3>
          <span style={{ fontSize: '0.7rem', color: '#10b981' }}>✓ Team Bot Configured</span>
        </div>
      </div>

      {/* SUB-TABS SELECTOR */}
      <div className="tab-toggle-group" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
        <button 
          onClick={() => setBotSubTab('bots')}
          style={{ background: 'transparent', border: 'none', borderBottom: botSubTab === 'bots' ? '2px solid #D4AF37' : '2px solid transparent', color: botSubTab === 'bots' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
        >
          The 3 Bots Ecosystem ({botConfigs.length})
        </button>
        <button 
          onClick={() => setBotSubTab('directory')}
          style={{ background: 'transparent', border: 'none', borderBottom: botSubTab === 'directory' ? '2px solid #D4AF37' : '2px solid transparent', color: botSubTab === 'directory' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
        >
          Telegram User Access Directory ({allUsersDirectory.length})
        </button>
        <button 
          onClick={() => setBotSubTab('pins')}
          style={{ background: 'transparent', border: 'none', borderBottom: botSubTab === 'pins' ? '2px solid #D4AF37' : '2px solid transparent', color: botSubTab === 'pins' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
        >
          PIN & Web Security Logs ({authPins.length})
        </button>
        <button 
          onClick={() => setBotSubTab('commands')}
          style={{ background: 'transparent', border: 'none', borderBottom: botSubTab === 'commands' ? '2px solid #D4AF37' : '2px solid transparent', color: botSubTab === 'commands' ? '#D4AF37' : '#94a3b8', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}
        >
          Commands & Mini App Matrix
        </button>
      </div>

      {/* SUB-TAB 1: THE 3 BOTS ECOSYSTEM */}
      {botSubTab === 'bots' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>The 3 Dedicated Telegram Bots Ecosystem</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>Configure API tokens, webhooks, welcome prompts, and mini-app interface endpoints for all 3 bots.</p>
          </div>

          <div className="bot-card-grid">
            {botConfigs.map(bot => {
              const isEditing = editingBotKey === bot.bot_key;

              return (
                <div key={bot.bot_key} className="glass-card" style={{ padding: '1.25rem', borderTop: '4px solid #D4AF37', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>{bot.bot_name}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#D4AF37', fontFamily: 'monospace' }}>{bot.bot_username}</span>
                    </div>
                    <span style={{ background: bot.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: bot.is_active ? '#10b981' : '#ef4444', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                      {bot.is_active ? '● Active' : 'Inactive'}
                    </span>
                  </div>

                  {!isEditing ? (
                    <>
                      <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#cbd5e1' }}>
                        <div>Bot Token: <strong style={{ color: bot.bot_token ? '#10b981' : '#ef4444', fontFamily: 'monospace' }}>{bot.bot_token ? `${bot.bot_token.slice(0, 12)}...` : 'Not Configured'}</strong></div>
                        <div>Mini-App Endpoint: <a href={bot.mini_app_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>{bot.mini_app_url || 'N/A'}</a></div>
                        <div>Webhook URL: <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{bot.webhook_url || 'Default'}</span></div>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '4px' }}>
                        "{bot.welcome_message || 'Welcome to GRO10X Bot.'}"
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                        <button onClick={() => handleOpenEditBot(bot)} style={{ flex: 1, background: 'rgba(212,175,55,0.2)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)', padding: '0.45rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.78rem', cursor: 'pointer' }}>
                          ⚙ Edit Config
                        </button>
                        <button onClick={() => handleRegisterWebhook(bot.bot_key)} style={{ flex: 1, background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)', padding: '0.45rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.78rem', cursor: 'pointer' }}>
                          🔗 Webhook
                        </button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleSaveBotConfig} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <div>
                        <label style={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block' }}>Bot API Token *</label>
                        <input type="text" value={botForm.bot_token} onChange={(e) => setBotForm({ ...botForm, bot_token: e.target.value })} className="form-input" placeholder="8824027905:AAF..." style={{ fontSize: '0.75rem' }} />
                      </div>

                      <div>
                        <label style={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block' }}>Telegram Username</label>
                        <input type="text" value={botForm.bot_username} onChange={(e) => setBotForm({ ...botForm, bot_username: e.target.value })} className="form-input" placeholder="@gro10x_bot" style={{ fontSize: '0.75rem' }} />
                      </div>

                      <div>
                        <label style={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block' }}>Mini-App Link</label>
                        <input type="text" value={botForm.mini_app_url} onChange={(e) => setBotForm({ ...botForm, mini_app_url: e.target.value })} className="form-input" style={{ fontSize: '0.75rem' }} />
                      </div>

                      <div>
                        <label style={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block' }}>Welcome Message</label>
                        <textarea value={botForm.welcome_message} onChange={(e) => setBotForm({ ...botForm, welcome_message: e.target.value })} className="form-input" rows={2} style={{ fontSize: '0.75rem' }} />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button type="submit" disabled={savingBot} className="btn-gold" style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem' }}>
                          {savingBot ? 'Saving...' : 'Save Bot'}
                        </button>
                        <button type="button" onClick={() => setEditingBotKey(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.45rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TELEGRAM USER ACCESS DIRECTORY */}
      {botSubTab === 'directory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>Telegram Access & PIN Verification Directory</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>Track Telegram Chat ID linkage and issue temporary web access PINs per user.</p>
            </div>

            <button 
              onClick={() => setShowPinModal(true)}
              style={{ background: '#D4AF37', color: '#000', border: 'none', padding: '0.45rem 0.95rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              🔑 Generate Temp PIN
            </button>
          </div>

          {/* CONTROLS ROW */}
          <div className="dir-controls">
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['All', 'admin', 'kam', 'promoter', 'investor'].map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: roleFilter === r ? '#D4AF37' : 'rgba(255,255,255,0.05)',
                    color: roleFilter === r ? '#000' : '#94a3b8',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {r}s
                </button>
              ))}
            </div>

            <input 
              type="text"
              placeholder="🔍 Search name or phone..."
              value={dirSearch}
              onChange={(e) => setDirSearch(e.target.value)}
              style={{ width: '220px', padding: '0.45rem 0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.8rem' }}
            />
          </div>

          {/* DIRECTORY TABLE */}
          <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.75rem' }}>User Name</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                  <th style={{ padding: '0.75rem' }}>Phone Number</th>
                  <th style={{ padding: '0.75rem' }}>Telegram Chat ID</th>
                  <th style={{ padding: '0.75rem' }}>Telegram Verification</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#fff' }}>{user.name}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ background: user.role === 'admin' ? 'rgba(212,175,55,0.15)' : 'rgba(59,130,246,0.15)', color: user.role === 'admin' ? '#D4AF37' : '#3b82f6', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#cbd5e1' }}>{user.phone}</td>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#D4AF37' }}>{user.chat_id || 'Not Linked'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ color: user.verified ? '#10b981' : '#f59e0b', fontWeight: 'bold', fontSize: '0.75rem' }}>
                        {user.verified ? '✓ Verified' : '⏳ Pending Link'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => {
                          setPinForm({ phone_number: user.phone === 'N/A' ? '' : user.phone, user_role: user.role, linked_name: user.name });
                          setShowPinModal(true);
                        }}
                        style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)', padding: '0.3rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        🔑 Issue Access PIN
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GENERATE PIN MODAL */}
      {showPinModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ width: '450px', background: '#0f172a', padding: '1.75rem', border: '1px solid rgba(212,175,55,0.4)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#D4AF37', fontSize: '1.1rem' }}>Generate Temporary Access PIN</h3>
              <button onClick={() => setShowPinModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleGeneratePin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>User Name / Target</label>
                <input type="text" value={pinForm.linked_name} onChange={(e) => setPinForm({ ...pinForm, linked_name: e.target.value })} className="form-input" placeholder="e.g. Firoz Uddin Ahmed" />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Phone Number *</label>
                <input type="text" value={pinForm.phone_number} onChange={(e) => setPinForm({ ...pinForm, phone_number: e.target.value })} className="form-input" placeholder="01708459008" required />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Role</label>
                <select value={pinForm.user_role} onChange={(e) => setPinForm({ ...pinForm, user_role: e.target.value })} style={{ width: '100%', padding: '0.6rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                  <option value="admin">Admin / Management</option>
                  <option value="kam">KAM (Managing Partner)</option>
                  <option value="promoter">Promoter</option>
                  <option value="investor">Investor</option>
                  <option value="client">Client / Business Founder</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" disabled={generatingPin} className="btn-gold" style={{ padding: '0.6rem 1.25rem' }}>
                  {generatingPin ? 'Generating...' : 'Issue 15-Min PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PIN & WEB SECURITY LOGS */}
      {botSubTab === 'pins' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>PIN Security & Verification Audit Logs</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>Real-time security log of temporary PIN generation, expiration, and web login verification.</p>
          </div>

          <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.75rem' }}>
                  <th style={{ padding: '0.75rem' }}>Issued At</th>
                  <th style={{ padding: '0.75rem' }}>Phone Number</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                  <th style={{ padding: '0.75rem' }}>Generated PIN</th>
                  <th style={{ padding: '0.75rem' }}>Expires At</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {authPins.map(pin => {
                  const isExpired = new Date(pin.pin_expires_at) < new Date();

                  return (
                    <tr key={pin.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem', color: '#94a3b8' }}>{new Date(pin.created_at).toLocaleString()}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#fff' }}>{pin.phone_number}</td>
                      <td style={{ padding: '0.75rem', color: '#D4AF37', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold' }}>{pin.user_role}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#10b981', fontWeight: 'bold', letterSpacing: '0.1em' }}>{pin.temp_pin}</td>
                      <td style={{ padding: '0.75rem', color: isExpired ? '#ef4444' : '#94a3b8' }}>{new Date(pin.pin_expires_at).toLocaleTimeString()}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <span style={{ background: pin.is_verified ? 'rgba(16,185,129,0.15)' : isExpired ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: pin.is_verified ? '#10b981' : isExpired ? '#ef4444' : '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                          {pin.is_verified ? '✓ Verified' : isExpired ? 'Expired' : 'Active 15-Min'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: COMMANDS & MINI APP MATRIX */}
      {botSubTab === 'commands' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37' }}>Management Bot Command & Mini App Matrix</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.1rem 0 0 0' }}>Overview of active slash commands, role-based inline keyboards, and the bKash-style Mini App endpoint.</p>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>📱 GRO10X bKash-Style Mini App Dashboard</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Target Route: <code>/team-miniapp</code></div>
              </div>
              <a href="/team-miniapp" target="_blank" rel="noreferrer" className="btn-gold" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textDecoration: 'none' }}>
                Launch Preview ↗
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
              <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '0.9rem' }}>🔴 Admin Suite</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>/kpis, /alerts, /leads, /payouts, /broadcast</div>
              </div>
              <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '0.9rem' }}>🟡 KAM Suite</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>/portfolio, /tickets</div>
              </div>
              <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem' }}>🟢 Promoter Suite</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>/mycode, /tier, /earnings, /survey, /payout</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
