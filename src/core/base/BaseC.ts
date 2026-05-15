import type { ICore } from "@engine-types/core";

/**
 * BaseC - Базовий контроллер
 * Всі контроллери наслідуються від цього класу
 */
export abstract class BaseC {
  protected core: ICore;

  constructor(core: ICore) {
    this.core = core;
  }

  /**
   * Ініціалізація контроллера
   */
  init(): void | Promise<void> {}

  /**
   * Оновлення контроллера
   * @param delta - час в секундах з минулого кадру
   */
  update(_delta: number): void {}

  /**
   * Очищення ресурсів
   */
  destroy(): void {}
}
