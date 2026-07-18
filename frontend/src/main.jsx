import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Auto-recover from Vite chunk loading errors during dynamic deployments
window.addEventListener('error', (e) => {
  const isChunkError = e.message && (
    e.message.includes('Failed to fetch dynamically imported module') ||
    e.message.includes('MIME type')
  );
  if (isChunkError) {
    const lastReload = sessionStorage.getItem('last_chunk_reload');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem('last_chunk_reload', now.toString());
      window.location.reload();
    }
  }
}, true);

window.addEventListener('unhandledrejection', (e) => {
  const isChunkError = e.reason && e.reason.message && (
    e.reason.message.includes('Failed to fetch dynamically imported module') ||
    e.reason.message.includes('MIME type')
  );
  if (isChunkError) {
    const lastReload = sessionStorage.getItem('last_chunk_reload');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem('last_chunk_reload', now.toString());
      window.location.reload();
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
