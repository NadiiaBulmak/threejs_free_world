import { BaseC } from "../base/BaseC";
import type { ICore } from "../../types/core";

/**
 * ResourceC - контроллер ресурсів
 * Управління текстурами, моделями, аудіо
 */
export class ResourceC extends BaseC {
  private resources: Map<string, any> = new Map();
  private loadPromises: Map<string, Promise<any>> = new Map();

  constructor(core: ICore) {
    super(core);
  }

  /**
   * Зберегти ресурс
   */
  set(id: string, resource: any): void {
    this.resources.set(id, resource);
  }

  /**
   * Отримати ресурс
   */
  get(id: string): any {
    return this.resources.get(id);
  }

  /**
   * Чи існує ресурс?
   */
  has(id: string): boolean {
    return this.resources.has(id);
  }

  /**
   * Видалити ресурс
   */
  remove(id: string): void {
    const resource = this.resources.get(id);
    if (resource && typeof resource.dispose === "function") {
      resource.dispose();
    }
    this.resources.delete(id);
  }

  /**
   * Очистити всі ресурси
   */
  override destroy(): void {
    for (const resource of this.resources.values()) {
      if (resource && typeof resource.dispose === "function") {
        try {
          resource.dispose();
        } catch (e) {
          console.warn("Error disposing resource:", e);
        }
      }
    }
    this.resources.clear();
    this.loadPromises.clear();
  }
}
