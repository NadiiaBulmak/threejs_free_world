import * as THREE from "three";
import * as SkeletonUtilsModule from "three/examples/jsm/utils/SkeletonUtils.js";
import type { ICore } from "@engine-types/core";

export class CharacterC {
  private core: ICore;
  private object: THREE.Object3D | null = null;

  constructor(core: ICore) {
    this.core = core;
  }

  init(object?: THREE.Object3D): void {
    if (object) this.setObject(object);
  }

  getObject(): THREE.Object3D | null {
    return this.object;
  }

  setObject(obj: THREE.Object3D): void {
    this.object = obj;
    // Attach movement/rotation controllers to the character
    try {
      if (this.core.move) this.core.move.setTarget(obj);
      if (this.core.rotate) this.core.rotate.setTarget(obj);
    } catch (e) {
      // ignore if controllers not available
    }
  }

  addToScene(name?: string): void {
    if (!this.object) return;
    this.core.scene.add(this.object, name);
  }

  setPosition(x: number, y: number, z: number): void {
    if (!this.object) return;
    this.object.position.set(x, y, z);
  }

  raiseY(amount: number): void {
    if (!this.object) return;
    this.object.position.y += amount;
  }

  raiseByHalfHeight(): void {
    if (!this.object) return;
    const box = new THREE.Box3().setFromObject(this.object);
    const size = new THREE.Vector3();
    box.getSize(size);
    const half = size.y / 2 || 0;
    this.object.position.y += half;
  }

  setScale(x: number, y: number, z: number): void {
    if (!this.object) return;
    this.object.scale.set(x, y, z);
  }

  setName(name: string): void {
    if (!this.object) return;
    this.object.name = name;
  }

  /**
   * Try to initialise the character from loaded resources (prefab or scene child).
   * Returns the created object or null.
   */
  initFromResource(prefabId: string, childName?: string): THREE.Object3D | null {
    // 1) direct resource
    const source = this.core.resources.get(prefabId) as THREE.Object3D | undefined;
    if (source) {
      const inst = this.cloneResource(source);
      if (childName) {
        const child = inst.getObjectByName(childName);
        this.setObject(child ?? inst);
      } else {
        this.setObject(inst);
      }
      return this.object;
    }

    // 2) try scene resource children
    const sceneRes = this.core.resources.get("scene") as THREE.Object3D | undefined;
    if (sceneRes) {
      const child = childName ? sceneRes.getObjectByName(childName) : null;
      if (child) {
        const inst = this.cloneResource(child);
        this.setObject(inst);
        return this.object;
      }
    }

    return null;
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
}

export default CharacterC;
