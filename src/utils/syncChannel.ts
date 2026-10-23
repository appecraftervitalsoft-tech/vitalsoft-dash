/**
 * Real-time synchronization bus across browser tabs/windows and tablet terminals
 * using the standard BroadcastChannel Web API.
 */

export interface SyncMessage {
  type:
    | 'SET_COMPLETED'
    | 'WORKOUT_STARTED'
    | 'WORKOUT_FINISHED'
    | 'CLIENTS_UPDATED'
    | 'ROUTINES_UPDATED';
  payload: any;
  timestamp: string;
}

class GymSyncBus {
  private channel: BroadcastChannel | null = null;
  private listeners: ((msg: SyncMessage) => void)[] = [];

  constructor() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.channel = new BroadcastChannel('irontrack_gym_sync');
        this.channel.onmessage = (event) => {
          const data: SyncMessage = event.data;
          this.listeners.forEach((fn) => fn(data));
        };
      }
    } catch {
      // BroadcastChannel not available fallback
    }
  }

  public publish(type: SyncMessage['type'], payload: any): void {
    const msg: SyncMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch {
        // ignore
      }
    }

    // Also trigger local storage event for cross-origin or fallback
    try {
      localStorage.setItem('irontrack_last_sync_event', JSON.stringify(msg));
    } catch {
      // ignore
    }

    // Notify local listeners
    this.listeners.forEach((fn) => fn(msg));
  }

  public subscribe(callback: (msg: SyncMessage) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((fn) => fn !== callback);
    };
  }
}

export const syncBus = new GymSyncBus();
