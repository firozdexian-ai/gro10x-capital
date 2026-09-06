'use client';
import React, { useState } from 'react';
import Navigation from '../../components/Navigation';
import { 
  Send, MessageSquare, ShieldCheck, Phone, CheckCircle2, ChevronRight, 
  Bot, Smartphone, Globe, Sparkles, Building2, Copy, Users, ExternalLink,
  Lock, TrendingUp, Award, Activity, QrCode
} from 'lucide-react';

const BOT_DATA = {
  investor: {
    title: 'HNI & Syndicate Investor Bot',
    handle: '@gro10xcapbot',
    link: 'https://t.me/gro10xcapbot',
    badge: 'Private Capital Desk',
    desc: 'Encrypted Telegram channel for high-ticket HNI investors to view portfolio holdings, quarterly yield receipts, KYC Level badges, and secondary market listings.',
    commands: [
      { cmd: '/portfolio', desc: 'Live AUM, active deals, and yield performance' },
      { cmd: '/yields', desc: 'Latest quarterly disbursement records & receipts' },
      { cmd: '/kyc', desc: 'Check identity verification level and limits' },
      { cmd: '/deals', desc: 'Browse live syndication deals & allocations' },
      { cmd: '/login', desc: 'Generate 6-digit one-time PIN for web portal' },
    ],
    mockReplies: {
      '/portfolio': '💼 <b>Your GRO10X Portfolio — Tariq Al-Mansoor</b>\n\n💰 Total Invested: <b>৳15,000,000 BDT</b>\n📊 Active Projects: <b>2 Deals</b>\n🎯 Target Yield: <b>19.2% IRR</b>\n\n  ▸ ORO Roasters (Mirpur 11) — ৳10,000,000\n  ▸ Segreto Secret Kitchen — ৳5,000,000\n\nTap below to open your full portfolio in Telegram Mini App.',
      '/yields': '📈 <b>Yield Disbursements — Q3 2026</b>\n\n• <b>ORO Roasters:</b> ৳150,000 BDT (Credited)\n• <b>Segreto Kitchen:</b> ৳75,000 BDT (Credited)\n\nTotal Yields Earned: <b>৳225,000 BDT</b>\nNext Payout Date: <b>15 October 2026</b>',
      '/kyc': '🛡️ <b>Identity Verification Status</b>\n\nInvestor: <b>Tariq Al-Mansoor</b>\nStatus: <b>KYC Level 3 (Institutional VIP)</b> ✅\nMax OTC Ticket Size: <b>Unlimited</b>\nSecondary Market Trading: <b>Enabled</b>',
      '/deals': '🔥 <b>Active Investment Deals</b>\n\n1. <b>ORO Roasters Hub 4</b> — 18.5% Franchise Yield (92% Funded)\n2. <b>Segreto Central Prep</b> — 22% Expected IRR (Origination)\n\nTap below to book your allocation before deal closes!',
      '/login': '🔐 <b>Web Login Verification PIN</b>\n\nYour temporary one-time PIN is:\n\n<code>849201</code>\n\nExpires in 15 minutes. Enter this on the GRO10X Investor Login screen.'
    }
  },
  founder: {
    title: 'SME Founder & Franchise Operator Bot',
    handle: '@gro10xbizbot',
    link: 'https://t.me/gro10xbizbot',
    badge: 'Operator Grid',
    desc: 'Purpose-built for SME founders, franchisors, and cohort applicants to track application due diligence, review SPV cap tables, and declare monthly revenue audits.',
    commands: [
      { cmd: '/status', desc: 'Check fundraising cohort application progress' },
      { cmd: '/captable', desc: 'View SPV investor breakdown and capital raised' },
      { cmd: '/pos', desc: 'Verify real-time Petpooja/Posify POS telemetry sync' },
      { cmd: '/audit', desc: 'Submit monthly balance sheet or physical audit' },
      { cmd: '/support', desc: 'Direct encrypted line to your assigned KAM' },
    ],
    mockReplies: {
      '/status': '📋 <b>Cohort Application Status — ORO Roasters</b>\n\n<b>Ref Code:</b> <code>GRO-COHORT-1042</code>\n<b>Stage:</b> <b>3. Diligence & POS Audit</b>\n<b>Assigned KAM:</b> Rahat Chowdhury (+880 1708-459008)\n\nInvestment Committee review scheduled for this Thursday.',
      '/captable': '🏛️ <b>SPV Cap Table — ORO Roasters Hub 3</b>\n\nTarget Raise: <b>৳20,000,000 BDT</b>\nRaised to Date: <b>৳18,500,000 (92.5%)</b>\nTotal Investors: <b>14 Syndicate Angels</b>\nFounder Retained Equity: <b>78.5%</b>',
      '/pos': '🟢 <b>POS Real-Time Telemetry Sync</b>\n\nProvider: <b>Petpooja API v2</b>\nStatus: <b>Live & Synchronized</b> ✅\nToday\'s Gross Sales: <b>৳84,500 BDT</b> (62 Invoices)\nMTD Gross: <b>৳1,420,000 BDT</b>',
      '/audit': '📊 <b>Submit Monthly Operating Report</b>\n\nPlease enter your MTD Revenue and Net Cash in hand for ORO Roasters:\n\nExample: <code>/report 1450000 280000</code>',
      '/support': '👨‍💼 <b>Your Assigned Key Account Manager</b>\n\n<b>Name:</b> Rahat Chowdhury (Senior KAM)\n<b>Phone:</b> +880 1708-459008\n<b>Office:</b> Level 7, Road 11, Banani, Dhaka\n\nReply directly to this bot to leave a message.'
    }
  },
  kam: {
    title: 'Key Account Manager & Field Ops Bot',
    handle: '@gro10xmanbot',
    link: 'https://t.me/gro10xmanbot',
    badge: 'Operations Desk',
    desc: 'Mission control for GRO10X Key Account Managers and field auditors. Log store site inspections, verify physical inventory, and manage private OTC cash concierge tickets.',
    commands: [
      { cmd: '/tickets', desc: 'Inspect pending OTC Block Trade cash tickets' },
      { cmd: '/audit', desc: 'Log on-site outlet inventory & cash counts' },
      { cmd: '/businesses', desc: 'View assigned brands and AI Health Scores' },
      { cmd: '/leads', desc: 'Assign and follow up on investor inquiries' },
    ],
    mockReplies: {
      '/tickets': '🎫 <b>Pending Cash Concierge Tickets</b>\n\n1. <b>Ticket #CASH-9912</b>\nInvestor: Tariq Al-Mansoor (Level 3 VIP)\nDeal: ORO Roasters Hub 4\nAmount: <b>৳10,000,000 BDT</b>\nFormat: In-Person Bank Room Meeting\n\nReply <code>/meet CASH-9912 Confirm</code> to schedule.',
      '/audit': '📸 <b>KAM Field Audit Logged</b>\n\nBrand: <b>ORO Roasters (Mirpur 11)</b>\nPhysical Cash in Register: <b>৳45,000 BDT</b>\nRaw Material Stock Value: <b>৳250,000 BDT</b>\nAI Health Score: <b>88/100 (Verified)</b> ✅\n\nPhotos uploaded to Supabase Storage.',
      '/businesses': '🏢 <b>Assigned Portfolio Brands (4)</b>\n\n1. ORO Roasters (F&B Franchise) — Score: 94\n2. Segreto Kitchens (Cloud Kitchen) — Score: 88\n3. Nordic Roastery (Retail) — Score: 81\n4. Artisan Bakery Hub (Wholesale) — Score: 76',
      '/leads': '🎯 <b>New Lead Queue (3 Unworked)</b>\n\n• Engr. Shafiqul Islam (৳5M budget) — WhatsApp: +8801711000000\n• Dr. Nusrat Jahan (৳10M budget) — Banani\n\nReply <code>/claim &lt;lead_id&gt;</code> to assign to yourself.'
    }
  },
  promoter: {
    title: 'Growth Promoter & Syndicate Lead Bot',
    handle: '@gro10xmanbot',
    link: 'https://t.me/gro10xmanbot',
    badge: 'Syndicate Network',
    desc: 'Empowers certified ecosystem promoters to share exclusive deal referral links, capture silent investor survey leads, track tier milestones, and request instant bKash/bank payouts.',
    commands: [
      { cmd: '/mycode', desc: 'Fetch your exclusive promoter referral link' },
      { cmd: '/tier', desc: 'Check your promoter tier and commission rates' },
      { cmd: '/earnings', desc: 'Review total commission earnings and accruals' },
      { cmd: '/payout', desc: 'Request instant commission payout' },
    ],
    mockReplies: {
      '/mycode': '🔗 <b>Your Exclusive Promoter Referral Link</b>\n\n<code>https://gro10x.capital/showcase?ref=GRO-PRO-07</code>\n\nShare this with high-net-worth individuals and corporate syndicates. Every completed investment earns you <b>1.5% instant commission</b>.',
      '/tier': '🏆 <b>Promoter Tier Status: Silver Syndicate Lead</b>\n\nTotal Deals Closed: <b>৳18,500,000 BDT</b>\nCommission Rate: <b>1.5%</b>\nProgress to Gold Tier (৳25M): <b>74%</b>\nUnlocks: 2.0% Override + Board Dinner Invite.',
      '/earnings': '💰 <b>Accrued Promoter Commissions</b>\n\nTotal Earned: <b>৳277,500 BDT</b>\nAvailable for Payout: <b>৳45,000 BDT</b>\nLast Payout: ৳120,000 via City Bank\n\nReply <code>/payout &lt;amount&gt;</code> to initiate disbursement.',
      '/payout': '💸 <b>Commission Payout Initiated</b>\n\nAmount: <b>৳45,000 BDT</b>\nMethod: <b>Bank Transfer (City Bank)</b>\nStatus: <b>Pending Director Clearance</b> ⏳\n\nYou will receive a notification here once cleared by Escrow.'
    }
  }
};

export default function TelegramEcosystemPage() {
  const [activeRole, setActiveRole] = useState('investor'); // 'investor' | 'founder' | 'kam' | 'promoter'
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: '👋 <b>Welcome to GRO10X Capital Telegram Mesh.</b>\n\nSelect a role tab and tap any command below to test the live bot logic:', 
      time: '10:00 AM' 
    }
  ]);
  const [inputVal, setInputVal] = useState('');

  const currentBot = BOT_DATA[activeRole];

  const handleRoleChange = (newRole) => {
    setActiveRole(newRole);
    const bot = BOT_DATA[newRole];
    setMessages([
      {
        sender: 'bot',
        text: `👋 Switched to <b>${bot.title}</b> (${bot.handle}).\n\n${bot.desc}\n\nSelect a quick command below:`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user', text, time: timeStr };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');

    setTimeout(() => {
      const replies = currentBot.mockReplies;
      const matchedCmd = Object.keys(replies).find(cmd => text.toLowerCase().startsWith(cmd.toLowerCase()));
      const responseText = matchedCmd 
        ? replies[matchedCmd] 
        : `🤖 <b>${currentBot.handle}</b> received: "<code>${text}</code>"\n\nProcessing live via Supabase Edge Router. Type <code>/help</code> or tap command chips below.`;

      setMessages((prev) => [...prev, { 
        sender: 'bot', 
        text: responseText, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }, 450);
  };

  return (
    <div style={{ background: '#070a14', color: '#f8fafc', minHeight: '100vh', paddingBottom: '6rem' }}>
      <Navigation />

      {/* ── HERO BANNER ── */}
      <div style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(7,10,20,1) 100%)', borderBottom: '1px solid rgba(0,136,204,0.3)', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <span style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(0,136,204,0.15)', border: '1px solid rgba(0,136,204,0.4)',
            borderRadius: '20px', padding: '0.35rem 1rem', color: '#0088cc',
            fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em',
            marginBottom: '1rem'
          }}>
            <Bot size={14} /> Dual-Engine Telegram MiniApp &amp; Bot Mesh
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0.5rem 0 1rem 0', color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Unified Field &amp; Capital Telegram Network
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.6', margin: 0 }}>
            In Bangladesh, high-speed capital allocation happens over instant messaging. Our 3 dedicated Telegram bots and Next.js MiniApp connect HNIs, SME founders, KAMs, and promoters directly to our PostgreSQL database.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: '1200px', margin: '3rem auto 0 auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '3rem', alignItems: 'start' }}>
        
        {/* ── LEFT: ROLE SELECTOR & BOT SPECIFICATIONS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 4 Stakeholder Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {[
              { id: 'investor', label: '1. Investor Bot', bot: '@gro10xcapbot', icon: TrendingUp },
              { id: 'founder', label: '2. Founder Bot', bot: '@gro10xbizbot', icon: Building2 },
              { id: 'kam', label: '3. Field KAM Bot', bot: '@gro10xmanbot', icon: ShieldCheck },
              { id: 'promoter', label: '4. Promoter Bot', bot: '@gro10xmanbot', icon: Award }
            ].map(r => {
              const Icon = r.icon;
              const isSelected = activeRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleRoleChange(r.id)}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: isSelected ? '1px solid #0088cc' : '1px solid rgba(255,255,255,0.08)',
                    background: isSelected ? 'rgba(0,136,204,0.12)' : 'rgba(15,23,42,0.6)',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 15px rgba(0,136,204,0.2)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <Icon size={16} style={{ color: isSelected ? '#0088cc' : '#94a3b8' }} />
                    <span style={{ fontWeight: '800', fontSize: '0.88rem', color: isSelected ? '#0088cc' : '#f8fafc' }}>
                      {r.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                    {r.bot}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Bot Spec Card */}
          <div className="glass-card" style={{ padding: '1.75rem', borderLeft: '4px solid #0088cc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span className="status-badge status-badge--info" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>
                  {currentBot.badge}
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f8fafc', margin: '0.5rem 0 0 0' }}>
                  {currentBot.title}
                </h2>
              </div>
              <a
                href={currentBot.link}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn action-btn--primary"
                style={{ background: '#0088cc', borderColor: '#0088cc', fontSize: '0.8rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
              >
                <Bot size={15} /> Launch Bot <ExternalLink size={13} />
              </a>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.5', margin: '0 0 1.25rem 0' }}>
              {currentBot.desc}
            </p>

            {/* Commands Table */}
            <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem 0' }}>
              Supported Slash Commands
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {currentBot.commands.map((c, i) => (
                <div 
                  key={i}
                  onClick={() => handleSendMessage(c.cmd)}
                  style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px',
                    fontSize: '0.82rem', cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  title="Click to simulate command in preview phone"
                >
                  <code style={{ color: '#0088cc', fontWeight: '700' }}>{c.cmd}</code>
                  <span style={{ color: '#94a3b8' }}>{c.desc}</span>
                </div>
              ))}
            </div>

            {/* WebApp MiniApp Action */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Smartphone size={18} style={{ color: '#D4AF37' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f8fafc' }}>Telegram MiniApp (/team-miniapp)</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Native in-chat webview with authenticated role isolation</div>
                </div>
              </div>
              <a
                href="/team-miniapp"
                className="action-btn action-btn--secondary"
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
              >
                Preview MiniApp →
              </a>
            </div>

          </div>

          {/* Database & Security Banner */}
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <ShieldCheck size={26} style={{ color: '#10b981', flexShrink: 0 }} />
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.4' }}>
              <strong>Row-Level Security &amp; PIN Verification:</strong> All Telegram commands authenticate via temporary PIN verification stored in PostgreSQL. Phone numbers are verified before granting access to confidential financial data.
            </div>
          </div>

        </div>

        {/* ── RIGHT: TELEGRAM SMARTPHONE SIMULATOR ── */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'sticky', top: '2rem' }}>
          <div style={{ width: '360px', height: '640px', background: '#0e1621', borderRadius: '36px', border: '8px solid #242f3d', boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            
            {/* PHONE HEADER */}
            <div style={{ background: '#17212b', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #0e1621' }}>
              <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #0088cc, #005588)', borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: '800' }}>
                <Bot size={20} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentBot.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#0088cc' }}>
                  {currentBot.handle} • bot
                </div>
              </div>
              <a 
                href={currentBot.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#94a3b8', textDecoration: 'none' }}
                title="Open real Telegram bot"
              >
                <ExternalLink size={16} />
              </a>
            </div>

            {/* CHAT MESSAGES STREAM */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#0e1621' }}>
              {messages.map((m, idx) => (
                <div key={idx} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
                  <div 
                    dangerouslySetInnerHTML={{ __html: m.text }}
                    style={{ 
                      background: m.sender === 'user' ? '#2b5278' : '#182533', 
                      padding: '0.65rem 0.85rem', borderRadius: '12px', color: '#fff', 
                      fontSize: '0.82rem', lineHeight: '1.45' 
                    }} 
                  />
                  <div style={{ fontSize: '0.65rem', color: '#6c7883', textAlign: m.sender === 'user' ? 'right' : 'left', marginTop: '0.2rem' }}>
                    {m.time}
                  </div>
                </div>
              ))}
            </div>

            {/* QUICK COMMAND ACTION CHIPS */}
            <div style={{ background: '#17212b', padding: '0.5rem', display: 'flex', gap: '0.4rem', overflowX: 'auto', borderTop: '1px solid #0e1621' }}>
              {currentBot.commands.map((c, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(c.cmd)}
                  style={chipStyle}
                >
                  {c.cmd}
                </button>
              ))}
            </div>

            {/* CHAT INPUT BAR */}
            <div style={{ background: '#17212b', padding: '0.6rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="text" 
                value={inputVal} 
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type command (e.g. /status)..." 
                style={{ flex: 1, background: '#0e1621', border: 'none', outline: 'none', color: '#fff', padding: '0.5rem 0.8rem', borderRadius: '18px', fontSize: '0.8rem' }} 
              />
              <button 
                onClick={() => handleSendMessage()} 
                style={{ width: '32px', height: '32px', background: '#0088cc', border: 'none', borderRadius: '50%', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
              >
                <Send size={14} />
              </button>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

const chipStyle = {
  background: '#242f3d',
  color: '#0088cc',
  border: 'none',
  padding: '0.3rem 0.65rem',
  borderRadius: '12px',
  fontSize: '0.74rem',
  fontWeight: '700',
  cursor: 'pointer',
  whiteSpace: 'nowrap'
};
