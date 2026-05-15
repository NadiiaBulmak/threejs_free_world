import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { UpdateBaseC } from "../base/UpdateBaseC";
import { engineConfig } from "../../config/engine.config";
import type { ICore } from "@engine-types/core";

/**
 * OrbitC - orbit camera controls (rotate / zoom / pan).
 */
export class OrbitC extends UpdateBaseC {
  private controls: OrbitControls | null = null;

  constructor(core: ICore) {
    super(core);

    if (!engineConfig.orbit.enabled) {
      this.isActive = false;
      return;
    }

    const cfg = engineConfig.orbit;
    const camera = this.core.camera.getCamera();
    const domElement = this.core.renderer.getCanvas();

    this.controls = new OrbitControls(camera, domElement);
    this.controls.target.set(cfg.target.x, cfg.target.y, cfg.target.z);
    this.controls.enableDamping = cfg.enableDamping;
    this.controls.dampingFactor = cfg.dampingFactor;
    this.controls.enableZoom = cfg.enableZoom;
    this.controls.enablePan = cfg.enablePan;
    this.controls.enableRotate = cfg.enableRotate;
    this.controls.minDistance = cfg.minDistance;
    this.controls.maxDistance = cfg.maxDistance;
    this.controls.maxPolarAngle = cfg.maxPolarAngle;
    this.controls.update();
  }

  getControls(): OrbitControls | null {
    return this.controls;
  }

  setTarget(x: number, y: number, z: number): void {
    this.controls?.target.set(x, y, z);
    this.controls?.update();
  }

  override update(_delta: number): void {
    super.update(_delta);
    if (!this.isActive || !this.controls) return;
    this.controls.update();
  }

  override destroy(): void {
    this.controls?.dispose();
    this.controls = null;
    super.destroy();
  }
}
