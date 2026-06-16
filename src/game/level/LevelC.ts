import * as THREE from "three";
import { BaseC } from "@core/base/BaseC";
import * as SkeletonUtilsModule from "three/examples/jsm/utils/SkeletonUtils.js";
import type { ICore } from "@engine-types/core";
import type {
  LevelEntry,
  LevelObjectPlacement,
  LevelsConfig,
} from "@engine-types/levels";
import { levelsConfig } from "@config/levels.config";

export class LevelC extends BaseC {
  private currentLevelId: string | null = null;
  private placedObjects: Map<number, THREE.Object3D> = new Map();
  private currentEntry: LevelEntry | null = null;

  constructor(core: ICore) {
    super(core);
  }

  getCurrentLevelId(): string | null {
    return this.currentLevelId;
  }

  getCurrentLevel(): LevelEntry | null {
    return this.currentEntry;
  }

  getPlacedObjects(): Map<number, THREE.Object3D> {
    return this.placedObjects;
  }

  getAvailableLevels(): LevelEntry[] {
    return (levelsConfig as LevelsConfig).levels.filter((l) => l.enabled);
  }

  async loadLevel(id: string): Promise<void> {
    const entry = (levelsConfig as LevelsConfig).levels.find(
      (l) => l.id === id,
    );
    if (!entry) {
      console.warn(`Level not found: ${id}`);
      return;
    }
    if (!entry.enabled) {
      console.warn(`Level ${id} is disabled`);
      return;
    }

    // unload previous
    this.unloadLevel();

    this.currentLevelId = id;
    this.currentEntry = entry;

    const sorted = entry.objects.slice().sort((a, b) => a.index - b.index);

    for (const placement of sorted) {
      try {
        const obj = this.spawnObject(placement, entry.id);
        const name = placement.name ?? `${entry.id}_obj_${placement.index}`;
        this.core.scene.add(obj, name);
        this.placedObjects.set(placement.index, obj);
      } catch (e) {
        console.warn("Failed to spawn object", e);
      }
    }

    try {
      this.core.events.emit("LEVEL_LOADED", { id, objectCount: sorted.length });
    } catch (e) {
      // ignore if events not ready
    }
  }

  unloadLevel(): void {
    if (!this.currentEntry) return;
    for (const [index, obj] of this.placedObjects.entries()) {
      const name = `${this.currentEntry.id}_obj_${index}`;
      this.core.scene.remove(name);
      if (obj.parent) obj.parent.remove(obj);
    }
    this.placedObjects.clear();
    this.currentLevelId = null;
    this.currentEntry = null;
  }

  private isArmatureObject(object: THREE.Object3D, prefabId?: string): boolean {
    const maybeName = (prefabId ?? object.name ?? "").toLowerCase();
    const objectName = object.name?.toLowerCase() ?? "";
    return maybeName.includes("armature") || objectName.includes("armature");
  }

  private normalizeImportedObject(
    object: THREE.Object3D,
    prefabId?: string,
  ): void {
    if (this.isArmatureObject(object, prefabId)) {
      object.scale.set(1, 1, 1);
      return;
    }

    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, 0.0001);
    const targetSize = 1.5;
    if (maxDim > targetSize * 1.5) {
      const factor = targetSize / maxDim;
      object.scale.multiplyScalar(factor);
    }
  }

  private cloneObject(object: THREE.Object3D): THREE.Object3D {
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

  spawnObject(p: LevelObjectPlacement, levelId?: string): THREE.Object3D {
    const prefabId = p.prefabId;
    // 1) Direct resource match
    let source = this.core.resources.get(prefabId) as
      | THREE.Object3D
      | undefined;

    if (source) {
      // If using a packed scene resource (id 'scene'), do not add the whole
      // resource into the runtime. Instead, expect the level placement to
      // specify which child to instantiate via `userData.childName`.
      const childName = p.userData && (p.userData as any).childName;
      if (prefabId === "scene") {
        if (childName) {
          const child = (source as THREE.Object3D).getObjectByName(childName);
          if (child) {
            const inst = this.cloneObject(child);
            this.normalizeImportedObject(inst, childName);
            inst.position.set(p.position.x, p.position.y, p.position.z);
            inst.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
            inst.scale.set(p.scale.x, p.scale.y, p.scale.z);
            inst.name = p.name ?? `${levelId ?? "level"}_obj_${p.index}`;
            if (p.userData) inst.userData = { ...inst.userData, ...p.userData };
            return inst;
          } else {
            console.warn(`LevelC: child '${childName}' not found in scene resource`);
            // fallthrough to continue and try other strategies
          }
        }

        // If no childName provided, skip cloning the whole scene to avoid
        // duplicating all scene children in the runtime. Return an empty
        // placeholder so caller doesn't accidentally add full scene.
        console.warn(
          `LevelC: prefabId 'scene' used without userData.childName — skipping full scene clone to avoid duplication`,
        );
        const placeholder = new THREE.Group();
        placeholder.name = p.name ?? `${levelId ?? "level"}_obj_${p.index}`;
        placeholder.userData = { ...(placeholder.userData || {}), ...(p.userData || {}) };
        return placeholder;
      }

      // Non-scene resource: clone whole resource as before
      const instance = this.cloneObject(source) as THREE.Object3D;
      this.normalizeImportedObject(instance, prefabId);
      instance.position.set(p.position.x, p.position.y, p.position.z);
      instance.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
      instance.scale.set(p.scale.x, p.scale.y, p.scale.z);
      instance.name = p.name ?? `${levelId ?? "level"}_obj_${p.index}`;
      if (p.userData) instance.userData = { ...instance.userData, ...p.userData };
      return instance;
    }

    // 2) If userData.childName provided, try to find that child inside a loaded scene resource
    const sceneRes = this.core.resources.get("scene") as
      | THREE.Object3D
      | undefined;
    const childName = p.userData && (p.userData as any).childName;
    if (sceneRes && childName) {
      const child = sceneRes.getObjectByName(childName);
      if (child) {
        const inst = this.cloneObject(child);
        this.normalizeImportedObject(inst, childName);
        inst.position.set(p.position.x, p.position.y, p.position.z);
        inst.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
        inst.scale.set(p.scale.x, p.scale.y, p.scale.z);
        inst.name = p.name ?? `${levelId ?? "level"}_obj_${p.index}`;
        if (p.userData) inst.userData = { ...inst.userData, ...p.userData };
        return inst;
      }
    }

    // 3) If prefabId matches a child name inside the loaded scene, clone that
    if (sceneRes) {
      const child = sceneRes.getObjectByName(prefabId);
      if (child) {
        const inst = this.cloneObject(child);
        this.normalizeImportedObject(inst, prefabId);
        inst.position.set(p.position.x, p.position.y, p.position.z);
        inst.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
        inst.scale.set(p.scale.x, p.scale.y, p.scale.z);
        inst.name = p.name ?? `${levelId ?? "level"}_obj_${p.index}`;
        if (p.userData) inst.userData = { ...inst.userData, ...p.userData };
        return inst;
      }
    }

    // Fallback primitives when prefab missing
    let mesh: THREE.Object3D;
    if (prefabId.includes("ground")) {
      const g = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshStandardMaterial({ color: 0x2a2a2a }),
      );
      g.rotation.x = -Math.PI / 2;
      mesh = g;
    } else if (prefabId.includes("tree")) {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 1),
        new THREE.MeshStandardMaterial({ color: 0x6b4b3a }),
      );
      trunk.position.y = 0.5;
      const crown = new THREE.Mesh(
        new THREE.ConeGeometry(0.6, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x1f7a1f }),
      );
      crown.position.y = 1.25;
      const group = new THREE.Group();
      group.add(trunk, crown);
      mesh = group;
    } else {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 0x4a9eff }),
      );
    }

    mesh.position.set(p.position.x, p.position.y, p.position.z);
    mesh.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
    mesh.scale.set(p.scale.x, p.scale.y, p.scale.z);
    mesh.name = p.name ?? `${levelId ?? "level"}_obj_${p.index}`;
    return mesh;
  }
}

export default LevelC;
