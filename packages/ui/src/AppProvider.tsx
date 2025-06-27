import React, { createContext, ReactNode } from 'react';
import { BackendAPI } from '@workspace/shared';

interface AppProviderProps {
  backend: BackendAPI;
  children: ReactNode;
}

export const BackendContext = createContext<BackendAPI | null>(null);

export function AppProvider({ backend, children }: AppProviderProps) {
  return (
    <BackendContext.Provider value={backend}>
      {children}
    </BackendContext.Provider>
  );
} 