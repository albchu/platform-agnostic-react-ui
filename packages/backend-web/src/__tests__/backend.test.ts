import { describe, it, expect, vi } from 'vitest';
import { WebBackend } from '../WebBackend';

describe('WebBackend', () => {
  it('initializes with default state', async () => {
    const backend = new WebBackend();
    const state = await backend.getState();
    
    expect(state).toEqual({ counter: 0 });
  });

  it('handles incrementCounter action', async () => {
    const backend = new WebBackend();
    
    await backend.dispatch({ type: 'incrementCounter' });
    const state = await backend.getState();
    
    expect(state.counter).toBe(1);
  });

  it('handles resetApp action', async () => {
    const backend = new WebBackend();
    
    // First increment
    await backend.dispatch({ type: 'incrementCounter' });
    await backend.dispatch({ type: 'incrementCounter' });
    
    // Then reset
    await backend.dispatch({ type: 'resetApp' });
    const state = await backend.getState();
    
    expect(state.counter).toBe(0);
  });

  it('notifies subscribers on state changes', async () => {
    const backend = new WebBackend();
    const subscription = backend.select('counter');
    
    const mockCallback = vi.fn();
    const unsubscribe = subscription.subscribe(mockCallback);
    
    await backend.dispatch({ type: 'incrementCounter' });
    
    expect(mockCallback).toHaveBeenCalledWith(1);
    
    unsubscribe();
  });

  it('returns current value from subscription', async () => {
    const backend = new WebBackend();
    await backend.dispatch({ type: 'incrementCounter' });
    
    const subscription = backend.select('counter');
    const value = await subscription.getValue();
    
 