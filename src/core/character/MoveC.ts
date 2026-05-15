import * as THREE from "three";
import { UpdateBaseC } from "../base/UpdateBaseC";
import type { ICore } from "@engine-types/core";

export class MoveC extends UpdateBaseC {
  private target: THREE.Object3D | null = null;
  private velocity = new THREE.Vector3();

  constructor(core: ICore) {
    super(core);
  }

  setTarget(object: THREE.Object3D | null): void {
    this.target = object;
  }

  getTarget(): THREE.Object3D | null {
    return this.target;
  }

  setVelocity(x: number, y: number, z: number): void {
    this.velocity.set(x, y, z);
  }

  getVelocity(): THREE.Vector3 {
    return this.velocity.clone();
  }

  move(delta: number): void {
    if (!this.target || !this.isActive) return;
    this.target.position.addScaledVector(this.velocity, delta);
  }

  override update(delta: number): void {
    super.update(delta);
    this.move(delta);
  }
}
