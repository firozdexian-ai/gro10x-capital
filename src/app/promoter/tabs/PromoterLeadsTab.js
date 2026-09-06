'use client';
import React from 'react';
import { PlusCircle, Search, Users } from 'lucide-react';

export default function PromoterLeadsTab({
  leads = [],
  newLeadName,
  setNewLeadName,
  newLeadPhone,
  setNewLeadPhone,
  newLeadEmail,
  setNewLeadEmail,
  newLeadCategory,
  setNewLeadCategory,
  newLeadInterest,
  setNewLeadInterest,
  isSubmittingLead,
  handleAddLead,
  leadSearch,
  setLeadSearch,
  leadStatusFilter,
  setLeadStatusFilter,
  filteredLeads = [],
  handleUpdateLeadStatus
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', alignItems: 'flex-start' }}>
      
      {/* LOG PROSPECT FORM */}
      <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #D4AF37' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
          <PlusCircle size={18} color="#D4AF37" /> Log Investor Prospect
        </h3>

        <form onSubmit={handleAddLead} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
              Investor Full Name *
            </label>
            <input 
              type="text" 
              value={newLeadName} 
              onChange={(e) => setNewLeadName(e.target.value)} 
              className="form-input" 
              placeholder="e.g. Engr. Shafiqul Islam" 
              style={{ fontSize: '0.82rem' }}
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                WhatsApp Phone *
              </label>
              <input 
                type="text" 
                value={newLeadPhone} 
                onChange={(e) => setNewLeadPhone(e.target.value)} 
                className="form-input" 
                placeholder="01700000000" 
                style={{ fontSize: '0.82rem' }}
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                Email Address (Optional)
              </label>
              <input 
                type="email" 
                value={newLeadEmail} 
                onChange={(e) => setNewLeadEmail(e.target.value)} 
                className="form-input" 
                placeholder="investor@example.com" 
                style={{ fontSize: '0.82rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                Investor Category
              </label>
              <select 
                value={newLeadCategory} 
                onChange={(e) => setNewLeadCategory(e.target.value)} 
                className="form-input"
                style={{ fontSize: '0.82rem' }}
              >
                <option value="NRB Expatriate">NRB Expatriate</option>
                <option value="Local HNI">Local HNI</option>
                <option value="Corporate Treasury">Corporate Treasury</option>
                <option value="Retail Syndicate">Retail Syndicate</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '700' }}>
                Investment Interest
              </label>
              <select 
                value={newLeadInterest} 
                onChange={(e) => setNewLeadInterest(e.target.value)} 
                className="form-input"
                style={{ fontSize: '0.82rem' }}
              >
                <option value="Franchise Yield (18%)">Franchise Yield (18%)</option>
                <option value="Equity Stake">Equity Stake</option>
                <option value="Short-Term Debt">Short-Term Debt</option>
                <option value="Exploring Options">Exploring Options</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmittingLead} 
            className="btn-gold" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: isSubmittingLead ? 0.7 : 1, fontSize: '0.82rem', padding: '0.65rem' }}
          >
            {isSubmittingLead ? 'Saving Prospect...' : 'Save Prospect to CRM Pipeline →'}
          </button>
        </form>
      </div>

      {/* LEADS QUEUE */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#fff' }}>
            My Logged Prospects Queue ({leads.length})
          </h3>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '160px' }}>
              <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={leadSearch} 
                onChange={(e) => setLeadSearch(e.target.value)} 
                className="form-input" 
                style={{ paddingLeft: '1.8rem', paddingRight: '0.5rem', paddingTop: '0.25rem', paddingBottom: '0.25rem', fontSize: '0.72rem' }} 
              />
            </div>
            <select 
              value={leadStatusFilter} 
              onChange={(e) => setLeadStatusFilter(e.target.value)} 
              className="form-input" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', width: 'auto' }}
            >
              <option value="All">All Statuses</option>
              <option value="New Lead">New Lead</option>
              <option value="Contacted">Contacted</option>
              <option value="Meeting Booked">Meeting Booked</option>
              <option value="Converted">Converted</option>
              <option value="Not Interested">Not Interested</option>
            </select>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Users size={38} style={{ color: '#334155', margin: '0 auto 0.5rem auto' }} />
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              {leadSearch || leadStatusFilter !== 'All' ? 'No prospects matched your search filter.' : 'No prospects logged yet. Use the form on the left to start building your 50-investor book.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {filteredLeads.map((l) => (
              <div 
                key={l.id} 
                style={{ 
                  background: 'rgba(7,10,20,0.6)', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: '800', color: '#fff' }}>{l.name}</span>
                    <span style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa', fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                      {l.category || 'Prospect'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    📞 {l.phone} {l.email && <span>• ✉️ {l.email}</span>} • <strong style={{ color: '#cbd5e1' }}>{l.interest || 'Exploring'}</strong>
                  </div>
                </div>

                {/* INLINE STATUS SELECTOR */}
                <div>
                  <select 
                    value={l.status || 'New Lead'} 
                    onChange={(e) => handleUpdateLeadStatus(l.id, e.target.value)}
                    className="form-input"
                    style={{ 
                      padding: '0.25rem 0.55rem', 
                      fontSize: '0.72rem', 
                      fontWeight: '800', 
                      borderRadius: '6px',
                      background: l.status === 'Converted' ? 'rgba(16,185,129,0.2)' : l.status === 'Meeting Booked' ? 'rgba(212,175,55,0.2)' : 'rgba(15,23,42,0.9)',
                      color: l.status === 'Converted' ? '#10b981' : l.status === 'Meeting Booked' ? '#D4AF37' : '#cbd5e1',
                      borderColor: l.status === 'Converted' ? 'rgba(16,185,129,0.4)' : l.status === 'Meeting Booked' ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.15)'
                    }}
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Meeting Booked">Meeting Booked</option>
                    <option value="Converted">Converted (Allocated)</option>
                    <option value="Not Interested">Not Interested</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
