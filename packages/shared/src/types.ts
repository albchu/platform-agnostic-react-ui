export interface AppState {
  counter: number;
}

export type Action =
  | { type: 'incrementCounter' }
  | { type: 'resetApp' }; 