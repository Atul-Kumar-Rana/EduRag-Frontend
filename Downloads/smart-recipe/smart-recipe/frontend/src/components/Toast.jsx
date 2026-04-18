import React, { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: '#d1e7dd', color: '#0a3622', icon: 'bi-check-circle-fill' },
    error: { bg: '#f8d7da', color: '#58151c', icon: 'bi-exclamation-circle-fill' },
    info: { bg: '#cff4fc', color: '#055160', icon: 'bi-info-circle-fill' },
  };
  const style = colors[type] || colors.success;

  return (
    <div className="toast-container">
      <div style={{ background: style.bg, color: style.color, padding: '12px 20px', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '240px', maxWidth: '360px' }}>
        <i className={`bi ${style.icon}`}></i>
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto', color: 'inherit', opacity: 0.7 }}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  );
}
