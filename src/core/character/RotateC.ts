import * as THREE from "three";
import { UpdateBaseC } from "../base/UpdateBaseC";
import type { ICore } from "@engine-types/core";

export class RotateC extends UpdateBaseC {
  private target: THREE.Object3D | null = null;
  private angularVelocityY = 0;

  constructor(core: ICore) {
    super(core);
  }

  setTarget(object: THREE.Object3D | null): void {
    this.target = object;
  }

  getTarget(): THREE.Object3D | null {
    return this.target;
  }

  setAngularVelocityY(radPerSec: number): void {
    this.angularVelocityY = radPerSec;
  }

  lookAt(point: THREE.Vector3): void {
    if (!this.target) return;
    this.target.lookAt(point);
  }

  rotateY(angle: number): void {
    if (!this.target) return;
    this.target.rotation.y += angle;
  }

  override update(delta: number): void {
    super.update(delta);
    if (!this.target || !this.isActive || this.angularVelocityY === 0) return;
    this.rotateY(this.angularVelocityY * delta);
  }
}
