import { EventEmitter } from 'events';
import { ipcMain } from 'electron';
import { AppState, Action } from '@workspace/shared';

export class ElectronBackend extends EventEmitter {
  private state: AppState = {
    counter: 0
  };

  constructor() {
    super();
    this.setupIpcHandlers();
  }

  private setupIpcHandlers(): void {
    // Handle action dispatch
    ipcMain.handle('backend:dispatch', async (_, action: Action) => {
      await this.dispatch(action);
    });

    // Handle state selection
    ipcMain.handle('backend:select', async (_, key: keyof AppState) => {
      return this.state[key];
    });

    // Handle full state retrieval
    ipcMain.handle('backend:getState', async () => {
      return { ...this.state };
    });

    // Handle subscription setup
    ipcMain.handle('backend:subscribe', async (event, key: keyof AppState) => {
      const webContents = event.sender;
      
      const listener = (value: any) => {
        webContents.send(`backend:state-update:${key}`, value);
      };

      this.on(`state-change:${key}`, listener);

      // Return unsubscribe function identifier
      const unsubscribeId = `${key}-${Date.now()}-${Math.random()}`;
      
      // Store unsubscribe handler
      ipcMain.handleOnce(`backend:unsubscribe:${unsubscribeId}`, () => {
        this.off(`state-change:${key}`, listener);
      });

      return unsubscribeId;
    });
  }

  private async dispatch(action: Action): Promise<void> {
    switch (action.type) {
      case 'incrementCounter':
        this.state = {
          ...this.state,
          counter: this.state.counter + 1
        };
        this.emit('state-change:counter', this.state.counter);
        break;

      case 'resetApp':
        this.state = {
          counter: 0
        };
        this.emit('state-change:counter', this.state.counter);
        break;

      default:
        console.warn('Unknown action type:', (action as any).type);
    }
  }

  getState(): AppState {
    return { ...this.state };
  }
} 