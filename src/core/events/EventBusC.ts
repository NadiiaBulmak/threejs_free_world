import type { EventCallback, ICore } from "@engine-types/core";
import { BaseC } from "../base/BaseC";

/**
 * EventBusC - global pub/sub for cross-system communication.
 */
export class EventBusC extends BaseC {
  private listeners: Map<string, EventCallback[]> = new Map();

  constructor(core: ICore) {
    super(core);
  }

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;

    const idx = callbacks.indexOf(callback);
    if (idx !== -1) {
      callbacks.splice(idx, 1);
    }
  }

  emit(event: string, data?: unknown): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;

    for (const callback of callbacks) {
      try {
        callback(data);
      } catch (e) {
        console.error(`Error in event listener for "${event}":`, e);
      }
    }
  }

  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  override destroy(): void {
    this.clear();
  }
}
