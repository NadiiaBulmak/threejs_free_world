import { BaseC } from "./BaseC";
import type { ICore } from "@engine-types/core";

/**
 * UpdateBaseC - базовий клас для контроллерів, що оновлюються в loop
 */
export abstract class UpdateBaseC extends BaseC {
  protected isActive: boolean = true;

  constructor(core: ICore) {
    super(core);
  }

  /**
   * Оновлення з часовим інтервалом
   */
  update(_delta: number): void {
    if (!this.isActive) return;
  }

  /**
   * Паузити оновлення
   */
  pause(): void {
    this.isActive = false;
  }

  /**
   * Відновити оновлення
   */
  resume(): void {
    this.isActive = true;
  }
}
