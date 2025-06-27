import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider, App } from '@workspace/ui';

// Type declaration for the API exposed by preload
declare global {
  interface Window {
    api: import('@workspace/shared').BackendAPI;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider backend={window.api}>
      <App />
    </AppProvider>
  </React.StrictMode>
); 