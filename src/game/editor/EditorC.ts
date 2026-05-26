import * as THREE from "three";
import { BaseC } from "@core/base/BaseC";
import type { ICore } from "@engine-types/core";
import type { LevelObjectPlacement, LevelEntry } from "@engine-types/levels";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

export class EditorC extends BaseC {
  private selection: THREE.Object3D | null = null;
  private transformControls: TransformControls | null = null;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  constructor(core: ICore) {
    super(core);
    // Setup TransformControls if renderer and camera available
    try {
      const camera = this.core.camera.getCamera();
      const dom = this.core.renderer.getCanvas();
      this.transformControls = new TransformControls(camera, dom);
      this.transformControls.addEventListener("dragging-changed", (ev) => {
        try {
          const controls = (this.core.orbit as any)?.getControls?.();
          if (controls) controls.enabled = !ev.value;
        } catch (e) {
          /* ignore */
        }
      });
      this.core.scene
        .getScene()
        .add(this.transformControls as unknown as THREE.Object3D);
    } catch (e) {
      // ignore if not all systems are ready
    }
  }

  selectByName(name: string): THREE.Object3D | null {
    const obj = this.core.scene.findInScene(name);
    this.selection = obj;
    this.attachTransform(obj);
    return obj;
  }

  selectObject(object: THREE.Object3D | null): THREE.Object3D | null {
    this.selection = object;
    this.attachTransform(object);
    return object;
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

  getSelection(): THREE.Object3D | null {
    return this.selection;
  }

  attachTransform(object: THREE.Object3D | null): void {
    if (!this.transformControls) return;
    if (object) this.transformControls.attach(object);
    else this.transformControls.detach();
  }

  buildLevelDesignFromScene(levelId = "level_01"): {
    levelId: string;
    objects: LevelObjectPlacement[];
  } {
    const scene = this.core.scene.getScene();
    const objects: LevelObjectPlacement[] = [];
    let idx = 0;
    for (const child of scene.children) {
      // skip lights and cameras
      if (
        child.type === "AmbientLight" ||
        child.type === "DirectionalLight" ||
        child.type === "HemisphereLight" ||
        child.type === "PerspectiveCamera"
      )
        continue;

      const pos = child.position;
      const rot = child.rotation;
      const sc = child.scale;
      const prefabId =
        (child.userData && (child.userData as any).prefabId) ||
        "prefab_unknown";

      objects.push({
        index: idx++,
        prefabId,
        position: { x: pos.x, y: pos.y, z: pos.z },
        rotation: { x: rot.x, y: rot.y, z: rot.z },
        scale: { x: sc.x, y: sc.y, z: sc.z },
        name: child.name || undefined,
        userData: child.userData || undefined,
      });
    }

    return { levelId, objects };
  }

  exportLevelJson(levelId = "level_01"): string {
    const data = this.buildLevelDesignFromScene(levelId);
    return JSON.stringify(data, null, 2);
  }

  importLevelDesign(
    entry: { levelId?: string; objects: LevelObjectPlacement[] } | LevelEntry,
  ): void {
    const objects = (entry as any).objects as LevelObjectPlacement[];
    // unload existing level objects: naive clear of scene children except lights/camera
    const scene = this.core.scene.getScene();
    const toRemove: THREE.Object3D[] = [];
    for (const child of scene.children) {
      if (
        child.type === "AmbientLight" ||
        child.type === "DirectionalLight" ||
        child.type === "HemisphereLight" ||
        child.type === "PerspectiveCamera"
      )
        continue;
      toRemove.push(child);
    }
    for (const r of toRemove) scene.remove(r);

    // spawn each object via LevelC-like logic: use resource or simple box
    for (const p of objects) {
      let source = this.core.resources.get(p.prefabId) as
        | THREE.Object3D
        | undefined;
      let instance: THREE.Object3D;
      if (source) {
        instance = source.clone(true);
      } else {
        instance = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({ color: 0x4a9eff }),
        );
      }
      instance.position.set(p.position.x, p.position.y, p.position.z);
      instance.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
      instance.scale.set(p.scale.x, p.scale.y, p.scale.z);
      instance.name = p.name ?? `obj_${p.index}`;
      instance.userData = {
        ...(instance.userData || {}),
        prefabId: p.prefabId,
      };
      this.core.scene.add(instance, instance.name);
    }
  }

  addObjectFromPrefab(
    prefabId: string,
    position = { x: 0, y: 0, z: 0 },
  ): THREE.Object3D {
    const source = this.core.resources.get(prefabId) as
      | THREE.Object3D
      | undefined;
    let instance: THREE.Object3D;
    if (source) {
      instance = source.clone(true);
    } else {
      // try to find child inside loaded scene resource
      const sceneRes = this.core.resources.get("scene") as
        | THREE.Object3D
        | undefined;
      const child = sceneRes?.getObjectByName(prefabId);
      if (child) {
        instance = child.clone(true);
      } else {
        instance = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({ color: 0x4a9eff }),
        );
      }
    }
    this.normalizeImportedObject(instance, prefabId);
    instance.position.set(position.x, position.y, position.z);
    instance.name = `${prefabId}_${Date.now().toString(36).slice(-6)}`;
    instance.userData = { ...(instance.userData || {}), prefabId };
    this.core.scene.add(instance, instance.name);
    this.selectObject(instance);
    return instance;
  }

  addObjectFromPrefabAtScreen(
    prefabId: string,
    clientX: number,
    clientY: number,
  ): THREE.Object3D | null {
    try {
      const canvas = this.core.renderer.getCanvas();
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;
      this.pointer.set(x, y);
      const camera = this.core.camera.getCamera();
      this.raycaster.setFromCamera(this.pointer, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const pos = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(plane, pos);
      const obj = this.addObjectFromPrefab(prefabId, {
        x: pos.x,
        y: pos.y,
        z: pos.z,
      });
      return obj;
    } catch (e) {
      console.warn("Failed to place prefab at screen position", e);
      return null;
    }
  }

  moveSelected(deltaX: number, deltaY: number, deltaZ: number): void {
    if (!this.selection) return;
    this.selection.position.x += deltaX;
    this.selection.position.y += deltaY;
    this.selection.position.z += deltaZ;
  }

  rotateSelected(deltaX: number, deltaY: number, deltaZ: number): void {
    if (!this.selection) return;
    this.selection.rotation.x += deltaX;
    this.selection.rotation.y += deltaY;
    this.selection.rotation.z += deltaZ;
  }

  scaleSelected(factor: number): void {
    if (!this.selection) return;
    this.selection.scale.multiplyScalar(factor);
  }

  selectByScreen(clientX: number, clientY: number): THREE.Object3D | null {
    const canvas = this.core.renderer.getCanvas();
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.pointer.set(x, y);
    const camera = this.core.camera.getCamera();
    this.raycaster.setFromCamera(this.pointer, camera);
    const scene = this.core.scene.getScene();
    const intersects = this.raycaster.intersectObjects(scene.children, true);
    for (const it of intersects) {
      const obj = it.object;
      if (
        obj.type === "AmbientLight" ||
        obj.type === "DirectionalLight" ||
        obj.type === "HemisphereLight" ||
        obj.type === "PerspectiveCamera"
      )
        continue;
      this.selection = obj;
      this.attachTransform(obj);
      return obj;
    }
    this.selection = null;
    this.attachTransform(null);
    return null;
  }

  setTransformMode(mode: "translate" | "rotate" | "scale"): void {
    if (!this.transformControls) return;
    this.transformControls.setMode(mode);
  }

  deleteObjectByName(name: string): boolean {
    const obj = this.core.scene.findInScene(name);
    if (!obj) return false;
    this.core.scene.remove(obj);
    return true;
  }

  reindexObjects(): void {
    const scene = this.core.scene.getScene();
    let idx = 0;
    for (const child of scene.children) {
      if (
        child.type === "AmbientLight" ||
        child.type === "DirectionalLight" ||
        child.type === "HemisphereLight" ||
        child.type === "PerspectiveCamera"
      )
        continue;
      child.userData = { ...(child.userData || {}), index: idx };
      idx++;
    }
  }
}

export default EditorC;
