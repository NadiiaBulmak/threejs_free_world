import * as THREE from "three";
import { UpdateBaseC } from "../base/UpdateBaseC";
import type { ICore } from "@engine-types/core";

/**
 * DebugC - контроллер для дебагу
 */
export class DebugC extends UpdateBaseC {
  private helpers: THREE.Object3D[] = [];
  private isVisible: boolean = false;

  constructor(core: ICore) {
    super(core);
  }

  /**
   * Показати сітку осей (↑ Y, → X, ← Z)
   */
  showAxesHelper(size: number = 10): THREE.AxesHelper {
    const helper = new THREE.AxesHelper(size);
    this.core.scene.add(helper);
    this.helpers.push(helper);
    return helper;
  }

  /**
   * Показати сітку
   */
  showGridHelper(
    size: number = 100,
    divisions: number = 20,
    colorCenter: number = 0x444444,
    colorGrid: number = 0x888888,
  ): THREE.GridHelper {
    const helper = new THREE.GridHelper(
      size,
      divisions,
      colorCenter,
      colorGrid,
    );
    this.core.scene.add(helper);
    this.helpers.push(helper);
    return helper;
  }

  /**
   * Показати камеру helper
   */
  showCameraHelper(): THREE.CameraHelper {
    const camera = this.core.camera.getCamera();
    const helper = new THREE.CameraHelper(camera);
    this.core.scene.add(helper);
    this.helpers.push(helper);
    return helper;
  }

  /**
   * Показати bounding box об'єкта
   */
  showBoundingBoxHelper(object: THREE.Object3D): THREE.BoxHelper {
    const helper = new THREE.BoxHelper(object, 0xffff00);
    this.core.scene.add(helper);
    this.helpers.push(helper);
    return helper;
  }

  /**
   * Показити всі helpers
   */
  showAll(): void {
    for (const helper of this.helpers) {
      helper.visible = true;
    }
    this.isVisible = true;
  }

  /**
   * Приховати всі helpers
   */
  hideAll(): void {
    for (const helper of this.helpers) {
      helper.visible = false;
    }
    this.isVisible = false;
  }

  /**
   * Toggle visibility
   */
  toggleVisibility(): void {
    if (this.isVisible) {
      this.hideAll();
    } else {
      this.showAll();
    }
  }

  /**
   * Логування інформації про камеру
   */
  logCameraInfo(): void {
    const camera = this.core.camera.getCamera();
    console.log("📷 Camera Info:", {
      position: camera.position,
      rotation: camera.rotation,
      fov: camera.fov,
      aspect: camera.aspect,
      near: camera.near,
      far: camera.far,
    });
  }

  /**
   * Логування інформації про сцену
   */
  logSceneInfo(): void {
    const scene = this.core.scene.getScene();
    console.log("🎬 Scene Info:", {
      childrenCount: scene.children.length,
      children: scene.children.map((c) => c.name || "unnamed"),
      fog: scene.fog,
      background: scene.background,
    });
  }

  /**
   * Логування FPS
   */
  logFPS(): void {
    const fps = this.core.time.getFPS();
    console.log(`⏱️ FPS: ${fps}`);
  }

  /**
   * Оновити  helpers (якщо потреба)
   */
  override update(delta: number): void {
    super.update(delta);
    if (!this.isActive) return;

    // Оновити helpers якщо потреба
    for (const helper of this.helpers) {
      if ("update" in helper) {
        (helper as any).update();
      }
    }
  }

  /**
   * Очистити ресурси
   */
  override destroy(): void {
    for (const helper of this.helpers) {
      this.core.scene.remove(helper);
    }
    this.helpers = [];
  }
}
