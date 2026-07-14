import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import AppRoutes from '@/routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

import { PropertyProvider } from '@/modules/property/context/PropertyContext';
import { ChatProvider } from '@/context/ChatContext';

function App() {
  React.useEffect(() => {
    const handleFocus = (e) => {
      if (window.innerWidth < 1024 && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 280);
      }
    };
    document.addEventListener('focusin', handleFocus);
    return () => document.removeEventListener('focusin', handleFocus);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <PropertyProvider>
            {/* Routing Shell */}
            <AppRoutes />
          </PropertyProvider>
        </ChatProvider>
        
        {/* Global Toast Alerts Provider */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg, #ffffff)',
              color: 'var(--toast-color, #1e293b)',
              fontFamily: "'Outfit', sans-serif",
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
