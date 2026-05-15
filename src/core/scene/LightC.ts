import * as THREE from "three";
import { DisposableC } from "../base/DisposableC";
import type { ICore } from "@engine-types/core";

/**
 * LightC - modular lighting controller.
 */
export class LightC extends DisposableC {
  private lights: Map<string, THREE.Light> = new Map();

  constructor(core: ICore) {
    super(core);
  }

  addAmbientLight(
    color: number = 0xffffff,
    intensity: number = 0.5,
    name: string = "ambient",
  ): THREE.AmbientLight {
    const light = new THREE.AmbientLight(color, intensity);
    this._registerLight(name, light);
    return light;
  }

  addDirectionalLight(
    color: number = 0xffffff,
    intensity: number = 1,
    position: THREE.Vector3 = new THREE.Vector3(5, 10, 5),
    name: string = "directional",
  ): THREE.DirectionalLight {
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.copy(position);
    this._registerLight(name, light);
    return light;
  }

  addPointLight(
    color: number = 0xffffff,
    intensity: number = 1,
    distance: number = 100,
    position: THREE.Vector3 = new THREE.Vector3(0, 10, 0),
    name: string = "point",
  ): THREE.PointLight {
    const light = new THREE.PointLight(color, intensity, distance);
    light.position.copy(position);
    this._registerLight(name, light);
    return light;
  }

  addSpotLight(
    color: number = 0xffffff,
    intensity: number = 1,
    position: THREE.Vector3 = new THREE.Vector3(5, 10, 5),
    target: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
    name: string = "spot",
  ): THREE.SpotLight {
    const light = new THREE.SpotLight(color, intensity);
    light.position.copy(position);
    light.target.position.copy(target);
    this.core.scene.add(light.target);
    this._registerLight(name, light);
    return light;
  }

  getLight(name: string): THREE.Light | undefined {
    return this.lights.get(name);
  }

  removeLight(name: string): void {
    const light = this.lights.get(name);
    if (light) {
      this.core.scene.remove(light);
      this.lights.delete(name);
    }
  }

  private _registerLight(name: string, light: THREE.Light): void {
    this.core.scene.add(light, name);
    this.lights.set(name, light);
    this.trackDisposable(light);
  }

  override destroy(): void {
    for (const name of [...this.lights.keys()]) {
      this.removeLight(name);
    }
    super.destroy();
  }
}
