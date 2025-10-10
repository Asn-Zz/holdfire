type EventCallback = (...args: any[]) => void;

class EventBus {
  private listeners: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: EventCallback): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event].filter(
      (listener) => listener !== callback
    );
  }

  emit(event: string, ...args: any[]): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event].forEach((listener) => listener(...args));
  }
}

const eventBus = new EventBus();
export default eventBus;
