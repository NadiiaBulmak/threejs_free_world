import { BaseC } from "./BaseC";
import type { ICore } from "@engine-types/core";

/**
 * DisposableC - базовий клас з автоматичним очищенням ресурсів
 */
export abstract class DisposableC extends BaseC {
  protected disposables: any[] = [];

  constructor(core: ICore) {
    super(core);
  }

  /**
   * Додати ресурс для очищення
   * @param resource - об'єкт з методом dispose()
   */
  protected trackDisposable(resource: any): void {
    if (resource && typeof resource.dispose === "function") {
      this.disposables.push(resource);
    }
  }

  /**
   * Очистити всі відстежені ресурси
   */
  destroy(): void {
    this.disposables.forEach((resource) => {
      try {
        resource.dispose();
      } catch (e) {
        console.warn("Error disposing resource:", e);
      }
    });
    this.disposables = [];
  }
}
