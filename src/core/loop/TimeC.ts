import { UpdateBaseC } from "../base/UpdateBaseC";
import type { ICore } from "@engine-types/core";

/**
 * TimeC - контроллер часу
 * Управління часом та deltaTime
 */
export class TimeC extends UpdateBaseC {
  private currentTime: number = 0;
  private deltaTime: number = 0;
  private lastTime: number = performance.now();
  private fps: number = 0;
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;

  constructor(core: ICore) {
    super(core);
  }

  /**
   * Отримати поточний час в секундах
   */
  getTime(): number {
    return this.currentTime;
  }

  /**
   * Отримати deltaTime
   */
  getDelta(): number {
    return this.deltaTime;
  }

  /**
   * Отримати FPS
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * Оновити час
   */
  override update(delta: number): void {
    super.update(delta);
    if (!this.isActive) return;

    const now = performance.now();
    this.deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.currentTime += this.deltaTime;

    // Обчислення FPS
    this.frameCount++;
    if (this.currentTime - this.lastFpsUpdate >= 1) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = this.currentTime;
    }

    // Обмежити deltaTime щоб уникнути стрибків
    if (this.deltaTime > 0.1) {
      this.deltaTime = 0.016; // 60 FPS
    }
  }
}
