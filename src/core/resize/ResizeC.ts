import { UpdateBaseC } from "../base/UpdateBaseC";
import type { ICore, ResizeCallback } from "@engine-types/core";

/**
 * ResizeC - контроллер зміни розміру вікна
 */
export class ResizeC extends UpdateBaseC {
  private callbacks: ResizeCallback[] = [];
  private width: number;
  private height: number;

  constructor(core: ICore) {
    super(core);

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this._setupListeners();
  }

  /** Викликати після створення camera та renderer */
  apply(): void {
    this._handleResize();
  }

  /**
   * Налаштування обробників
   */
  private _setupListeners(): void {
    window.addEventListener("resize", () => {
      this._handleResize();
    });
  }

  /**
   * Обробити зміну розміру
   */
  private _handleResize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    if (this.core.camera) {
      this.core.camera.resize(this.width, this.height);
    }

    if (this.core.renderer) {
      this.core.renderer.setSize(this.width, this.height);
    }

    // Викликати callbacks
    for (const callback of this.callbacks) {
      try {
        callback(this.width, this.height);
      } catch (e) {
        console.error("Error in resize callback:", e);
      }
    }
  }

  /**
   * Отримати ширину
   */
  getWidth(): number {
    return this.width;
  }

  /**
   * Отримати висоту
   */
  getHeight(): number {
    return this.height;
  }

  /**
   * Додати callback при resize
   */
  onResize(callback: ResizeCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Видалити callback
   */
  removeResizeCallback(callback: ResizeCallback): void {
    const idx = this.callbacks.indexOf(callback);
    if (idx !== -1) {
      this.callbacks.splice(idx, 1);
    }
  }

  /**
   * Очистити ресурси
   */
  override destroy(): void {
    this.callbacks = [];
  }
}
