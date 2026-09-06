'use client';
import React from 'react';
import { DollarSign, Filter, Phone, MessageSquare, Mail } from 'lucide-react';
import { formatCurrency } from '../../../lib/currency';

export default function CashPipelineTab({
  cashTickets = [],
  activeCashPipeline = 0,
  pendingCashTicketsCount = 0,
  clearedCashTicketsCount = 0,
  cashFilter = 'All',
  setCashFilter,
  filteredCashTickets = [],
  currency = 'BDT',
  getCashTicketStatusStyle
}) {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      
      {/* HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: 0, color: '#D4AF37' }}>
            Assigned Cash Concierge & OTC Block Pipeline
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
            Private physical consultation desk, offline banking settlement, and escrow clearance
          </p>
        </div>
      </div>

      {/* 3-CARD TAB-LEVEL CASH KPI STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #D4AF37' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Pipeline Value
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#D4AF37', margin: 0 }}>
              {formatCurrency(activeCashPipeline, currency)}
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Assigned OTC</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #f59e0b' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pending Consultations
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#f59e0b', margin: 0 }}>
              {pendingCashTicketsCount}
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>● Awaiting Review</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: '0 0 0.35rem 0', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Cleared Capital
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#10b981', margin: 0 }}>
              {clearedCashTicketsCount}
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#10b981' }}>✓ Funds Settled</span>
          </div>
        </div>

      </div>

      {/* STATUS FILTER PILLS */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'All', label: 'All Tickets', count: cashTickets.length },
          { key: 'Pending_Review', label: 'Pending Review', count: cashTickets.filter(t => t.status === 'Pending_Review').length },
          { key: 'Meeting_Scheduled', label: 'Meeting Scheduled', count: cashTickets.filter(t => t.status === 'Meeting_Scheduled').length },
          { key: 'Funds_Cleared', label: 'Funds Cleared', count: cashTickets.filter(t => t.status === 'Funds_Cleared').length },
          { key: 'Closed', label: 'Closed / Final', count: cashTickets.filter(t => ['Closed', 'Rejected'].includes(t.status)).length }
        ].map(tab => {
          const isSel = cashFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setCashFilter(tab.key)}
              style={{
                background: isSel ? 'rgba(212,175,55,0.2)' : 'rgba(15,23,42,0.6)',
                color: isSel ? '#D4AF37' : '#94a3b8',
                border: isSel ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.06)',
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: isSel ? '800' : '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                fontSize: '0.68rem',
                background: isSel ? '#D4AF37' : 'rgba(255,255,255,0.08)',
                color: isSel ? '#000' : '#94a3b8',
                padding: '0.05rem 0.4rem',
                borderRadius: '10px',
                fontWeight: '800'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* CASH TICKETS LIST */}
      {cashTickets.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 2rem', color: '#64748b' }}>
          <DollarSign size={40} style={{ margin: '0 auto 0.75rem auto', color: '#334155' }} />
          <h3 style={{ margin: 0, fontWeight: '800', fontSize: '1.05rem', color: '#94a3b8' }}>
            No cash concierge tickets assigned to your investors
          </h3>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>
            OTC block trading requests initiated by KYC Level 3 investors will automatically route here.
          </p>
        </div>
      ) : filteredCashTickets.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem', color: '#64748b' }}>
          <Filter size={32} style={{ margin: '0 auto 0.5rem auto', color: '#334155' }} />
          <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem', color: '#94a3b8' }}>
            No tickets match the &quot;{cashFilter}&quot; filter.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {filteredCashTickets.map((ticket) => {
            const statusStyle = getCashTicketStatusStyle(ticket.status);
            const investor = ticket.investors;
            const displayName = investor?.requires_anonymity ? investor?.alias_name : (investor?.alias_name || investor?.full_name || 'HNI Client');
            const kycLevel = investor?.kyc_level || 3;
            const projectTitle = ticket.funding_projects?.project_title || 'Private OTC Placement';
            const brandName = ticket.funding_projects?.businesses?.brand_name || 'GRO10X Hub';

            return (
              <div 
                key={ticket.id} 
                className="glass-card"
                style={{ 
                  padding: '1.5rem', 
                  borderLeft: `4px solid ${statusStyle.color}`,
                  background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(7,10,20,0.85))'
                }}
              >
                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#D4AF37', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {brandName}
                      </span>
                      <span style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, padding: '0.15rem 0.55rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: '900' }}>
                      {projectTitle}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      Requested: {new Date(ticket.created_at).toLocaleDateString()} • Ticket ID: #{ticket.id?.substring(0, 8)}
                    </div>
                  </div>

                  {/* TICKET AMOUNT */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.04em' }}>
                      OTC Block Order
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#D4AF37' }}>
                      {formatCurrency(ticket.ticket_amount_bdt, currency)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '700' }}>
                      🔒 Escrow Physical Placement
                    </div>
                  </div>
                </div>

                {/* CLIENT & MEETING DETAILS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', background: 'rgba(7,10,20,0.5)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', margin: '0.85rem 0' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Client Account</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                      {displayName}
                      <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.05rem 0.35rem', borderRadius: '4px', fontWeight: '800' }}>
                        L{kycLevel}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Preferred Meeting Time</span>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#cbd5e1', marginTop: '0.1rem' }}>
                      {ticket.preferred_meeting_time || 'Awaiting Confirmation'}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Meeting Format</span>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#60a5fa', marginTop: '0.1rem' }}>
                      {ticket.meeting_format || 'In-Person (HQ Concierge)'}
                    </div>
                  </div>

                  {ticket.confirmed_meeting_date && (
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Confirmed Schedule</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#f0b429', marginTop: '0.1rem' }}>
                        {new Date(ticket.confirmed_meeting_date).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {ticket.funds_transfer_ref && (
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Funds Transfer Ref</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#10b981', marginTop: '0.1rem' }}>
                        {ticket.funds_transfer_ref}
                      </div>
                    </div>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {investor?.phone && (
                    <a 
                      href={`tel:${investor.phone}`}
                      style={{ 
                        background: 'rgba(59,130,246,0.15)', 
                        color: '#60a5fa', 
                        border: '1px solid rgba(59,130,246,0.3)', 
                        padding: '0.4rem 0.85rem', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: '800', 
                        textDecoration: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.35rem' 
                      }}
                    >
                      <Phone size={13} /> Direct Call
                    </a>
                  )}
                  {investor?.phone && (
                    <a 
                      href={`https://wa.me/${investor.phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        background: 'rgba(16,185,129,0.15)', 
                        color: '#10b981', 
                        border: '1px solid rgba(16,185,129,0.3)', 
                        padding: '0.4rem 0.85rem', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: '800', 
                        textDecoration: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.35rem' 
                      }}
                    >
                      <MessageSquare size={13} /> WhatsApp
                    </a>
                  )}
                  {investor?.email && (
                    <a 
                      href={`mailto:${investor.email}`}
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        color: '#cbd5e1', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        padding: '0.4rem 0.85rem', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: '700', 
                        textDecoration: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.35rem' 
                      }}
                    >
                      <Mail size={13} /> Email
                    </a>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
