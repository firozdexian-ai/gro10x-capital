'use client';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.75rem', pointerEvents: 'none' }}>
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            style={{ 
              pointerEvents: 'auto',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${toast.type === 'error' ? 'rgba(239, 68, 68, 0.5)' : toast.type === 'success' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(212, 175, 55, 0.5)'}`,
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              animation: 'slideIn 0.3s ease-out forwards',
              minWidth: '300px'
            }}
          >
            {toast.type === 'error' && <AlertCircle size={20} style={{ color: '#ef4444' }} />}
            {toast.type === 'success' && <CheckCircle2 size={20} style={{ color: '#10b981' }} />}
            {toast.type === 'info' && <Info size={20} style={{ color: '#D4AF37' }} />}
            
            <p style={{ color: '#f8fafc', margin: 0, fontSize: '0.9rem', flex: 1 }}>{toast.message}</p>
            
            <button 
              onClick={() => removeToast(toast.id)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: '0.2rem' }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}} />
    </ToastContext.Provider>
  );
}
