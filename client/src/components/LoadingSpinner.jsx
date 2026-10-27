import React from 'react';

const LoadingSpinner = ({ message = 'Loading wardrobe...', fullPage = false }) => {
  const content = (
    <div className="page-loading-wrapper">
      <div className="spinner spinner-lg"></div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
        {message}
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          width: '100%',
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;

