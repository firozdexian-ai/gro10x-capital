'use client';
import React from 'react';
import { Send, FileText, PlusCircle, ShieldCheck, ArrowRight, Calendar, UserCheck, CheckCircle2 } from 'lucide-react';
import { formatCurrency, CURRENCY_RATES } from '../../../lib/currency';

/** Shorthand Bengali/Crore currency formatter helper */
function formatShorthand(val, curr = 'BDT') {
  const num = Number(val) || 0;
  const rate = CURRENCY_RATES[curr]?.rate || 1;
  const symbol = CURRENCY_RATES[curr]?.symbol || '৳';
  const converted = num * rate;

  if (curr === 'BDT') {
    if (converted >= 10000000) {
      return `${symbol}${(converted / 10000000).toFixed(2)} Crore`;
    }
    if (converted >= 100000) {
      return `${symbol}${(converted / 100000).toFixed(1)} Lakhs`;
    }
    return `${symbol}${converted.toLocaleString()}`;
  }

  if (converted >= 1000000) {
    return `${symbol}${(converted / 1000000).toFixed(2)}M`;
  }
  if (converted >= 1000) {
    return `${symbol}${(converted / 1000).toFixed(1)}K`;
  }
  return `${symbol}${converted.toLocaleString()}`;
}

/**
 * CashConciergeTab — Production Tab 6 OTC Advisory Desk & Cash Pipeline for GRO10X Admin.
 *
 * Sub-tabs:
 *   1. 'pipeline'   — Confidential OTC pipeline tickets queue with expanded inspection drawer
 *   2. 'new-ticket' — Form to manually log a new OTC advisory ticket
 */
export default function CashConciergeTab({
  // KPI data
  cashTickets = [],
  // Sub-tab control
  cashSubTab = 'pipeline',
  setCashSubTab,
  // Sub-tab 1: Pipeline Queue
  cashStatusFilter = 'All',
  setCashStatusFilter,
  selectedCashTicket = null,
  setSelectedCashTicket,
  cashMeetingForm = { date: '', format: 'In_Person' },
  setCashMeetingForm,
  cashNoteInput = '',
  setCashNoteInput,
  cashFundsRef = '',
  setCashFundsRef,
  savingCashAction = false,
  pushingCashTelegram = false,
  allKams = [],
  handleCashKamAssign,
  handleCashMeetingConfirm,
  handleCashFundsCleared,
  handleCashStatusUpdate,
  handleSaveCashNote,
  handlePushCashTelegramNotif,
  // Sub-tab 2: Admin Log OTC Ticket
  adminTicketForm = { investor_id: '', target_project_id: '', ticket_amount_bdt: '', preferred_meeting_time: '', meeting_format: 'In_Person', admin_notes: '' },
  setAdminTicketForm,
  handleCreateCashTicket,
  allInvestors = [],
  projects = [],
  // Shared
  currency = 'BDT',
}) {
  const activePipelineValue = cashTickets
    .filter(t => !['Closed', 'Rejected'].includes(t.status))
    .reduce((acc, t) => acc + Number(t.ticket_amount_bdt || 0), 0);

  const filteredTickets = cashTickets.filter(t => cashStatusFilter === 'All' || t.status === cashStatusFilter);

  return (
    <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ── KPI METRIC STRIP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Card 1: Pending Review */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(212,175,55,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pending Review
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#D4AF37', margin: 0 }}>
            {cashTickets.filter(t => t.status === 'Pending_Review').length}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Awaiting Advisory Review</span>
        </div>

        {/* Card 2: Meetings Scheduled */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(59,130,246,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Meetings Scheduled
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>
            {cashTickets.filter(t => t.status === 'Meeting_Scheduled').length}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#3b82f6' }}>OTC Consultations Confirmed</span>
        </div>

        {/* Card 3: Funds Cleared */}
        <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(16,185,129,0.3)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Funds Cleared
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981', margin: 0 }}>
            {cashTickets.filter(t => t.status === 'Funds_Cleared').length}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Verified Escrow Capital</span>
        </div>

        {/* Card 4: Active Pipeline Value */}
        <div className="glass-card-premium" style={{ padding: '1.25rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Pipeline Value
          </p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#D4AF37', margin: 0 }}>
            {formatShorthand(activePipelineValue, currency)}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#D4AF37' }}>
            Exact: {formatCurrency(activePipelineValue, currency)}
          </span>
        </div>
      </div>

      {/* ── SUB-TABS SELECTOR STRIP ── */}
      <div className="tab-toggle-group" style={{ width: 'fit-content' }}>
        <button
          onClick={() => setCashSubTab('pipeline')}
          className={`tab-toggle-btn ${cashSubTab === 'pipeline' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <FileText size={15} /> Confidential OTC Pipeline Queue ({cashTickets.length})
        </button>
        <button
          onClick={() => setCashSubTab('new-ticket')}
          className={`tab-toggle-btn ${cashSubTab === 'new-ticket' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <PlusCircle size={15} /> Admin Log OTC Ticket
        </button>
      </div>

      {/* ── SUB-TAB 1: PIPELINE QUEUE ── */}
      {cashSubTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Status Filter Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
            {['All', 'Pending_Review', 'Meeting_Scheduled', 'Funds_Cleared', 'Closed', 'Rejected'].map(st => {
              const isActive = cashStatusFilter === st;
              const count = st === 'All' ? cashTickets.length : cashTickets.filter(t => t.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setCashStatusFilter(st)}
                  className={`tab-toggle-btn ${isActive ? 'active' : ''}`}
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', whiteSpace: 'nowrap' }}
                >
                  {st.replace(/_/g, ' ')} ({count})
                </button>
              );
            })}
          </div>

          {/* Ticket Cards List */}
          {filteredTickets.length === 0 ? (
            /* Elevated Empty State */
            <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', display: 'grid', placeItems: 'center', color: '#D4AF37' }}>
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 0.35rem 0' }}>
                  {cashStatusFilter === 'All' ? 'No Confidential OTC Consultation Tickets Logged Yet' : `No OTC Tickets Found in "${cashStatusFilter.replace(/_/g, ' ')}"`}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '480px', margin: 0 }}>
                  {cashStatusFilter === 'All' 
                    ? 'High-net-worth individual (HNI) private placement requests and confidential advisory block trades are securely routed and managed here.'
                    : 'There are currently no active tickets matching this filter status.'}
                </p>
              </div>
              {cashStatusFilter === 'All' ? (
                <button
                  onClick={() => setCashSubTab('new-ticket')}
                  className="btn-gold"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', marginTop: '0.5rem' }}
                >
                  <PlusCircle size={16} /> Log First OTC Ticket
                </button>
              ) : (
                <button
                  onClick={() => setCashStatusFilter('All')}
                  className="btn-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', marginTop: '0.5rem' }}
                >
                  Reset Filter to All
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredTickets.map(ticket => {
                const isSelected = selectedCashTicket?.id === ticket.id;
                const isPending = ticket.status === 'Pending_Review';
                const isScheduled = ticket.status === 'Meeting_Scheduled';
                const isCleared = ticket.status === 'Funds_Cleared';
                
                const statusColor = isCleared ? '#10b981' : isScheduled ? '#3b82f6' : isPending ? '#D4AF37' : ticket.status === 'Closed' ? '#94a3b8' : '#ef4444';

                const investorAlias = ticket.investors?.requires_anonymity 
                  ? `[Anonymized ${ticket.investors?.alias_name?.slice(0, 4)}***]` 
                  : (ticket.investors?.alias_name || 'Client');

                return (
                  <div key={ticket.id} className="deal-card" style={{ borderLeft: `4px solid ${statusColor}`, padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(ticket.created_at).toLocaleDateString()}</span>
                          <h4 style={{ margin: '0.1rem 0 0 0', fontSize: '1.15rem', color: '#D4AF37', fontWeight: 'bold' }}>{investorAlias}</h4>
                        </div>
                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Target Project Campaign</span>
                          <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.92rem', color: '#fff', fontWeight: '600' }}>
                            {ticket.funding_projects?.businesses?.brand_name} - {ticket.funding_projects?.project_title}
                          </p>
                        </div>
                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Target Commitment</span>
                          <p style={{ margin: '0.1rem 0 0 0', fontSize: '1.05rem', color: '#10b981', fontWeight: 'bold' }}>
                            {formatCurrency(ticket.ticket_amount_bdt, currency)}
                          </p>
                        </div>
                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Managing Partner</span>
                          <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.85rem', color: '#D4AF37' }}>
                            {ticket.kams?.full_name || 'Unassigned'}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className={`status-badge ${isCleared ? 'status-badge--success' : isScheduled ? 'status-badge--info' : isPending ? 'status-badge--gold' : 'status-badge--muted'}`}>
                          ● {ticket.status.replace(/_/g, ' ')}
                        </span>

                        <button
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCashTicket(null);
                            } else {
                              setSelectedCashTicket(ticket);
                              setCashMeetingForm({
                                date: ticket.confirmed_meeting_date ? new Date(ticket.confirmed_meeting_date).toISOString().slice(0, 16) : '',
                                format: ticket.meeting_format || 'In_Person'
                              });
                            }
                          }}
                          className="btn-sm"
                          style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                        >
                          {isSelected ? 'Close File ▲' : 'Inspect File ▼'}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Drilldown Inspector Panel */}
                    {isSelected && (
                      <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem', background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '8px' }}>
                        
                        {/* Left Column: Investor Profile & Notes */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <h4 style={{ margin: 0, color: '#D4AF37', fontSize: '1rem' }}>👤 Advisory File Details</h4>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#0f172a', padding: '1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                            <div>
                              <p style={{ color: '#64748b', margin: '0 0 0.2rem 0', fontSize: '0.75rem' }}>Client Identity</p>
                              <p style={{ margin: 0, color: '#fff', fontWeight: 'bold' }}>{ticket.investors?.alias_name}</p>
                            </div>
                            <div>
                              <p style={{ color: '#64748b', margin: '0 0 0.2rem 0', fontSize: '0.75rem' }}>KYC Clearance</p>
                              <p style={{ margin: 0, color: '#10b981', fontWeight: 'bold' }}>Level {ticket.investors?.kyc_level || 3} Verified</p>
                            </div>
                            <div>
                              <p style={{ color: '#64748b', margin: '0 0 0.2rem 0', fontSize: '0.75rem' }}>Direct Phone</p>
                              <p style={{ margin: 0, color: '#fff' }}>{ticket.investors?.phone || 'On file'}</p>
                            </div>
                            <div>
                              <p style={{ color: '#64748b', margin: '0 0 0.2rem 0', fontSize: '0.75rem' }}>Email Address</p>
                              <p style={{ margin: 0, color: '#fff' }}>{ticket.investors?.email || 'On file'}</p>
                            </div>
                            <div>
                              <p style={{ color: '#64748b', margin: '0 0 0.2rem 0', fontSize: '0.75rem' }}>Client Preferred Time</p>
                              <p style={{ margin: 0, color: '#D4AF37' }}>{ticket.preferred_meeting_time || 'Flexible'}</p>
                            </div>
                            <div>
                              <p style={{ color: '#64748b', margin: '0 0 0.2rem 0', fontSize: '0.75rem' }}>Meeting Format</p>
                              <p style={{ margin: 0, color: '#fff' }}>{(ticket.meeting_format || 'In_Person').replace(/_/g, ' ')}</p>
                            </div>
                          </div>

                          {ticket.confirmed_meeting_date && (
                            <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                              <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>📅 Confirmed Meeting Time: </span>
                              <strong style={{ color: '#fff' }}>{new Date(ticket.confirmed_meeting_date).toLocaleString()}</strong>
                            </div>
                          )}

                          {ticket.funds_transfer_ref && (
                            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                              <span style={{ color: '#10b981', fontWeight: 'bold' }}>✅ Escrow Reference: </span>
                              <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{ticket.funds_transfer_ref}</strong>
                              <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                                (Cleared {new Date(ticket.funds_cleared_at).toLocaleDateString()})
                              </span>
                            </div>
                          )}

                          {/* Internal Notes History */}
                          <div>
                            <h5 style={{ margin: '0 0 0.4rem 0', color: '#94a3b8', fontSize: '0.8rem' }}>Advisory &amp; Diligence Notes Log</h5>
                            <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', minHeight: '60px', maxHeight: '120px', overflowY: 'auto', fontSize: '0.8rem', color: '#cbd5e1', whiteSpace: 'pre-line', border: '1px solid rgba(255,255,255,0.05)' }}>
                              {ticket.admin_notes || 'No advisory notes recorded yet.'}
                            </div>
                          </div>

                          {/* Append Note Form */}
                          <form onSubmit={(e) => handleSaveCashNote(e, ticket.id)} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                              type="text"
                              placeholder="Log advisory note / call outcome..."
                              value={cashNoteInput}
                              onChange={(e) => setCashNoteInput(e.target.value)}
                              style={{ flex: 1, background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem' }}
                            />
                            <button type="submit" disabled={savingCashAction} style={{ background: '#D4AF37', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>
                              Save Note
                            </button>
                          </form>

                        </div>

                        {/* Right Column: Managing Partner Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '1.5rem' }}>
                          <h4 style={{ margin: 0, color: '#D4AF37', fontSize: '1rem' }}>⚙️ Managing Partner Actions</h4>

                          {/* KAM Assignment Dropdown */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Assign Managing Partner (KAM)</label>
                            <select
                              value={ticket.kam_id || ''}
                              onChange={(e) => handleCashKamAssign(ticket.id, e.target.value)}
                              style={{ width: '100%', padding: '0.6rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}
                            >
                              <option value="">-- Choose Partner --</option>
                              {allKams.map(k => (
                                <option key={k.id} value={k.id}>{k.full_name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Schedule Consultation Form */}
                          <form onSubmit={(e) => handleCashMeetingConfirm(e, ticket.id)} style={{ background: '#0f172a', padding: '0.85rem', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#3b82f6' }}>📅 Schedule &amp; Confirm Consultation</span>
                            
                            <input
                              type="datetime-local"
                              value={cashMeetingForm.date}
                              onChange={(e) => setCashMeetingForm({ ...cashMeetingForm, date: e.target.value })}
                              style={{ width: '100%', padding: '0.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }}
                              required
                            />
                            
                            <select
                              value={cashMeetingForm.format}
                              onChange={(e) => setCashMeetingForm({ ...cashMeetingForm, format: e.target.value })}
                              style={{ width: '100%', padding: '0.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }}
                            >
                              <option value="In_Person">In-Person Meeting (GRO10X HQ)</option>
                              <option value="Virtual_Call">Virtual Video Call (Zoom)</option>
                              <option value="Phone_Consultation">Confidential Phone Call</option>
                            </select>

                            <button type="submit" disabled={savingCashAction} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.6rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>
                              Confirm Meeting Schedule
                            </button>
                          </form>

                          {/* Record Funds Clearance Form */}
                          <form onSubmit={(e) => handleCashFundsCleared(e, ticket.id)} style={{ background: '#0f172a', padding: '0.85rem', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#10b981' }}>💳 Verify &amp; Clear Escrow Funds</span>
                            
                            <input
                              type="text"
                              placeholder="Bank TXN / Escrow Ref ID"
                              value={cashFundsRef}
                              onChange={(e) => setCashFundsRef(e.target.value)}
                              style={{ width: '100%', padding: '0.5rem', background: '#070a14', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '0.8rem' }}
                            />

                            <button type="submit" disabled={savingCashAction} style={{ background: '#10b981', color: '#000', border: 'none', padding: '0.6rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>
                              Mark Funds Cleared
                            </button>
                          </form>

                          {/* Quick Status Buttons */}
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleCashStatusUpdate(ticket.id, 'Closed')}
                              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '0.55rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              Close Ticket File
                            </button>
                            <button
                              onClick={() => handleCashStatusUpdate(ticket.id, 'Rejected')}
                              style={{ flex: 1, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.55rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              Decline Consultation
                            </button>
                          </div>

                          {/* Push Telegram Update Button */}
                          <button
                            onClick={() => handlePushCashTelegramNotif(ticket, ticket.status === 'Meeting_Scheduled' ? 'meeting_confirmed' : ticket.status === 'Funds_Cleared' ? 'funds_cleared' : 'status_update')}
                            disabled={pushingCashTelegram}
                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                          >
                            <Send size={15} /> {pushingCashTelegram ? 'Pushing...' : 'Notify Investor via Telegram'}
                          </button>

                        </div>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ── SUB-TAB 2: ADMIN LOG OTC TICKET ── */}
      {cashSubTab === 'new-ticket' && (
        <div className="glass-card-premium" style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={20} /> Admin Log OTC Advisory Ticket
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Manually record a confidential block trade inquiry on behalf of a verified HNI / UHNWI investor.
          </p>

          <form onSubmit={handleCreateCashTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Select HNI Investor</label>
              <select
                value={adminTicketForm.investor_id}
                onChange={(e) => setAdminTicketForm({ ...adminTicketForm, investor_id: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                required
              >
                <option value="">-- Choose Investor --</option>
                {allInvestors.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.alias_name} ({inv.investor_category || 'HNI'}) - {inv.phone || inv.email || 'KYC L' + (inv.kyc_level || 1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Target Project Campaign</label>
              <select
                value={adminTicketForm.target_project_id}
                onChange={(e) => setAdminTicketForm({ ...adminTicketForm, target_project_id: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                required
              >
                <option value="">-- Choose Project --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.businesses?.brand_name ? `${p.businesses.brand_name} - ` : ''}{p.project_title}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Target Commitment Amount (BDT)</label>
              <input
                type="number"
                placeholder="e.g. 10000000 (= ৳1.0 Crore)"
                value={adminTicketForm.ticket_amount_bdt}
                onChange={(e) => setAdminTicketForm({ ...adminTicketForm, ticket_amount_bdt: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Preferred Meeting Time</label>
                <input
                  type="text"
                  placeholder="e.g. Tomorrow 3 PM"
                  value={adminTicketForm.preferred_meeting_time}
                  onChange={(e) => setAdminTicketForm({ ...adminTicketForm, preferred_meeting_time: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Meeting Format</label>
                <select
                  value={adminTicketForm.meeting_format}
                  onChange={(e) => setAdminTicketForm({ ...adminTicketForm, meeting_format: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                >
                  <option value="In_Person">In-Person Meeting</option>
                  <option value="Virtual_Call">Virtual Call (Zoom)</option>
                  <option value="Phone_Consultation">Phone Call</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.3rem' }}>Advisory &amp; Initial Notes</label>
              <textarea
                rows={3}
                placeholder="Initial consultation notes, investor preferences..."
                value={adminTicketForm.admin_notes}
                onChange={(e) => setAdminTicketForm({ ...adminTicketForm, admin_notes: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
              />
            </div>

            <button type="submit" disabled={savingCashAction} className="btn-gold" style={{ padding: '0.85rem', justifyContent: 'center', marginTop: '0.5rem', fontWeight: '700' }}>
              {savingCashAction ? 'Logging Ticket...' : 'Log OTC Advisory Ticket'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
