import * as THREE from "three";
import { DisposableC } from "../base/DisposableC";
import * as SkeletonUtilsModule from "three/examples/jsm/utils/SkeletonUtils.js";
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

  init(): void {
    const geometry = new THREE.PlaneGeometry(5, 5);

    const material = new THREE.MeshBasicMaterial({ 
        color: 0xf2dfb1, 
        side: THREE.DoubleSide
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
    plane.scale.set(10, 10, 10); // Scale the plane to make it larger
    this.scene.add(plane);
  }

  /**
   * Додати об'єкт на сцену
   */
  add(object: THREE.Object3D, name?: string): THREE.Object3D {
    this.scene.add(object);
    if (name) {
      this.objects.set(name, object);
    }

    // Log the added object and current scene contents
    try {
      const id = name ?? object.name ?? object.type ?? object.uuid;
      console.log(`[SceneC] Added to scene: ${id}`, object);
      this.logSceneContents();
    } catch (e) {
      // ignore logging errors
    }

    return object;
  }

  /** Лог поточного вмісту сцени */
  private logSceneContents(): void {
    try {
      const items = this.scene.children.map((o) => ({
        name: o.name || "(no-name)",
        type: o.type,
        uuid: o.uuid,
      }));
      console.log("[SceneC] Scene contents:", items);
    } catch (e) {
      // ignore
    }
  }

  private cloneResource(object: THREE.Object3D): THREE.Object3D {
    let hasSkinnedMesh = false;
    object.traverse((child) => {
      if ((child as any).isSkinnedMesh) hasSkinnedMesh = true;
    });
    const SkeletonUtils =
      ((SkeletonUtilsModule as any)
        .SkeletonUtils as typeof import("three/examples/jsm/utils/SkeletonUtils.js")) ||
      (SkeletonUtilsModule as any);
    return hasSkinnedMesh
      ? (SkeletonUtils.clone(object as any) as THREE.Object3D)
      : object.clone(true);
  }

  /**
   * Додати Armature (персонажа) на сцену з розміром 1,1,1
   */
  /**
   * Додати Armature (персонажа) на сцену — всередині шукаємо `char1`.
   * Якщо ресурс передано — додаємо клон `char1` (або сам ресурс якщо дочірній не знайдено).
   */
  addArmature(
    armature?: THREE.Object3D,
    childName = "char1",
    name = "Armature",
  ): THREE.Object3D {
    let toAdd: THREE.Object3D;

    if (armature) {
      const cloned = this.cloneResource(armature);
      const child = cloned.getObjectByName(childName);
      cloned.name = name;
      toAdd = cloned;

      if (child) {
        // Keep the full cloned armature hierarchy so a skinned mesh retains its bones
        child.name = childName;
      }
    } else {
      toAdd = new THREE.Group();
      toAdd.name = name;
    }

    toAdd.scale.set(1, 1, 1);
    return this.add(toAdd, name);
  }

  /**
   * Add a scene directly from a loaded resource (as it is in the file).
   * Returns the added object or null if the resource was not found.
   */
  addSceneFromResource(
    resourceId = "scene",
    name = "scene",
  ): THREE.Object3D | null {
    const res = this.core.resources?.get(resourceId) as
      | THREE.Object3D
      | undefined;
    if (!res) {
      console.warn(`[SceneC] Resource '${resourceId}' not found`);
      return null;
    }

    // Clone the scene resource to avoid modifying the original
    const cloned = this.cloneResource(res as THREE.Object3D);
    cloned.name = name;
    return this.add(cloned, name);
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
