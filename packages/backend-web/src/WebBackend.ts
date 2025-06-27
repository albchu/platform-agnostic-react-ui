import { AppState, Action, BackendAPI, StateSubscription } from '@workspace/shared';

type StateListener<T> = (value: T) => void;

class WebStateSubscription<T> implements StateSubscription<T> {
  constructor(
    private getValue_: () => T,
    private subscribe_: (callback: StateListener<T>) => () => void
  ) {}

  async getValue(): Promise<T> {
    return this.getValue_();
  }

  subscribe(callback: StateListener<T>): () => void {
    return this.subscribe_(callback);
  }
}

export class WebBackend implements BackendAPI {
  private state: AppState = {
    counter: 0
  };

  private listeners = new Map<keyof AppState, Set<StateListener<any>>>();

  constructor() {
    // Initialize listener sets for each state key
    Object.keys(this.state).forEach(key => {
      this.listeners.set(key as keyof AppState, new Set());
    });
  }

  async dispatch(action: Action): Promise<void> {
    switch (action.type) {
      case 'incrementCounter':
        this.state = {
          ...this.state,
          counter: this.state.counter + 1
        };
        this.notifyListeners('counter', this.state.counter);
        break;

      case 'resetApp':
        this.state = {
          counter: 0
        };
        this.notifyListeners('counter', this.state.counter);
        break;

      default:
        console.warn('Unknown action type:', (action as any).type);
    }
  }

  select<K extends keyof AppState>(key: K): StateSubscription<AppState[K]> {
    return new WebStateSubscription(
      () => this.state[key],
      (callback: StateListener<AppState[K]>) => {
        const listeners = this.listeners.get(key);
        if (listeners) {
          listeners.add(callback);
          return () => listeners.delete(callback);
        }
        return () => {}; // No-op unsubscribe
      }
    );
  }

  async getState(): Promise<AppState> {
    return { ...this.state };
  }

  private notifyListeners<K extends keyof AppState>(key: K, value: AppState[K]): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(listener => listener(value));
    }
  }
} 