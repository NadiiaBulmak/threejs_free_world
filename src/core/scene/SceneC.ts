import * as THREE from "three";
import { DisposableC } from "../base/DisposableC";
import type { ICore } from "../../types/core";

/**
 * SceneC - контроллер сцени
 * Управління об'єктами на сцені
 */
export class SceneC extends DisposableC {
  private scene: THREE.Scene;
  private objects: Map<string, THREE.Object3D>;

  constructor(core: ICore) {
    super(core);
    this.scene = new THREE.Scene();
    this.objects = new Map();
  }

  /**
   * Додати об'єкт на сцену
   */
  add(object: THREE.Object3D, name?: string): THREE.Object3D {
    this.scene.add(object);
    if (name) {
      this.objects.set(name, object);
    }
    return object;
  }

  /**
   * Видалити об'єкт зі сцени
   */
  remove(objectOrName: THREE.Object3D | string): void {
    const object =
      typeof objectOrName === "string"
        ? this.objects.get(objectOrName)
        : objectOrName;

    if (object) {
      this.scene.remove(object);
      for (const [key, val] of this.objects.entries()) {
        if (val === object) {
          this.objects.delete(key);
        }
      }
    }
  }

  /**
   * Знайти об'єкт за ім'ям
   */
  findByName(name: string): THREE.Object3D | undefined {
    return this.objects.get(name);
  }

  /**
   * Знайти об'єкт за назвою (рекурсивно через scene)
   */
  findInScene(name: string): THREE.Object3D | null {
    return this.scene.getObjectByName(name) ?? null;
  }

  /**
   * Отримати сцену
   */
  getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Отримати всі об'єкти
   */
  getChildren(): THREE.Object3D[] {
    return this.scene.children;
  }

  /**
   * Очистити сцену від всіх об'єктів
   */
  clear(): void {
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
    this.objects.clear();
  }

  /**
   * Очистити ресурси
   */
  destroy(): void {
    this.clear();
    super.destroy();
  }
}
