import React from 'react';

export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-border" style={{ color: 'var(--primary)', width: '2.5rem', height: '2.5rem' }} role="status"></div>
      <p className="mt-3 text-muted">{text}</p>
    </div>
  );
}
