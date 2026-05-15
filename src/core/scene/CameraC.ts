import * as THREE from "three";
import { UpdateBaseC } from "../base/UpdateBaseC";
import { cameraConfig } from "@config/camera.config";
import type { CameraOrientationConfig } from "@config/camera.config";
import type { ICore } from "@engine-types/core";

export type Orientation = "portrait" | "landscape";

export class CameraC extends UpdateBaseC {
  private camera: THREE.PerspectiveCamera;
  private orientation: Orientation;

  constructor(core: ICore) {
    super(core);

    const width = window.innerWidth;
    const height = window.innerHeight;
    this.orientation = this._computeOrientation(width, height);

    const cfg = cameraConfig[this.orientation];
    const aspect = width / Math.max(height, 1);

    this.camera = new THREE.PerspectiveCamera(cfg.fov, aspect, cfg.near, cfg.far);
    this._applyConfig(cfg);
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getOrientation(): Orientation {
    return this.orientation;
  }

  applyOrientationConfig(width?: number, height?: number): void {
    const w = width ?? window.innerWidth;
    const h = height ?? window.innerHeight;
    this.orientation = this._computeOrientation(w, h);
    const cfg = cameraConfig[this.orientation];
    this.camera.fov = cfg.fov;
    this.camera.near = cfg.near;
    this.camera.far = cfg.far;
    this._applyConfig(cfg);
    this.camera.updateProjectionMatrix();
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(height, 1);
    this.applyOrientationConfig(width, height);
  }

  setPosition(x: number | THREE.Vector3, y?: number, z?: number): void {
    if (typeof x === "object") {
      this.camera.position.copy(x);
    } else if (y !== undefined && z !== undefined) {
      this.camera.position.set(x, y, z);
    }
  }

  lookAt(target: THREE.Vector3 | THREE.Object3D): void {
    if ("position" in target) {
      this.camera.lookAt(target.position);
    } else {
      this.camera.lookAt(target);
    }
  }

  private _computeOrientation(width: number, height: number): Orientation {
    return height > width ? "portrait" : "landscape";
  }

  private _applyConfig(cfg: CameraOrientationConfig): void {
    this.camera.position.set(cfg.position.x, cfg.position.y, cfg.position.z);
    this.camera.lookAt(cfg.lookAt.x, cfg.lookAt.y, cfg.lookAt.z);
  }
}
