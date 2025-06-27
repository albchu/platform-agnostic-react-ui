import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider, App } from '@workspace/ui';
import { WebBackend } from '@workspace/backend-web';

// Create web backend instance
const webBackend = new WebBackend();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider backend={webBackend}>
      <App />
    </AppProvider>
  </React.StrictMode>
); 