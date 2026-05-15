import * as THREE from "three";
import type * as CANNON from "cannon-es";
import { UpdateBaseC } from "../base/UpdateBaseC";
import { engineConfig } from "../../config/engine.config";
import type { ICore } from "@engine-types/core";

export interface PhysicsBodyOptions {
  mass?: number;
  shape?: "box" | "sphere" | "cylinder";
  friction?: number;
  restitution?: number;
  linearDamping?: number;
  angularDamping?: number;
}

/**
 * PhysicsC - Cannon-es physics world (optional via engine config).
 */
export class PhysicsC extends UpdateBaseC {
  private isEnabled = false;
  private cannon: typeof CANNON | null = null;
  private world: CANNON.World | null = null;
  private bodies: Map<string, CANNON.Body> = new Map();
  private meshToBody: Map<THREE.Object3D, CANNON.Body> = new Map();
  // private gravity = new THREE.Vector3(0, -9.81, 0);
  private gravity = new THREE.Vector3(0, 0, 0);
  private timeStep = 1 / 60;

  constructor(core: ICore) {
    super(core);
    const g = engineConfig.physics.gravity;
    this.gravity.set(g.x, g.y, g.z);
    void this._initPhysics();
  }

  private async _initPhysics(): Promise<void> {
    try {
      const CANNON = await import("cannon-es");
      this.cannon = CANNON;

      this.world = new CANNON.World();
      this.world.gravity.set(this.gravity.x, this.gravity.y, this.gravity.z);
      this.world.defaultContactMaterial.friction = 0.4;
      this.world.defaultContactMaterial.restitution = 0.3;

      if (engineConfig.physics.enabled) {
        this.isEnabled = true;
      }
    } catch (error) {
      console.warn("Physics engine unavailable:", error);
      this.isEnabled = false;
    }
  }

  enable(): void {
    this.isEnabled = this.world !== null;
  }

  disable(): void {
    this.isEnabled = false;
  }

  isPhysicsEnabled(): boolean {
    return this.isEnabled && this.world !== null && this.cannon !== null;
  }

  setGravity(x: number, y: number, z: number): void {
    this.gravity.set(x, y, z);
    this.world?.gravity.set(x, y, z);
  }

  getGravity(): THREE.Vector3 {
    return this.gravity.clone();
  }

  createRigidBody(
    mesh: THREE.Object3D,
    options: PhysicsBodyOptions = {},
  ): CANNON.Body | null {
    if (!this.isPhysicsEnabled() || !this.cannon || !this.world) {
      return null;
    }

    const CANNON = this.cannon;
    const mass = options.mass ?? 1;
    const shape = options.shape ?? "box";
    const friction = options.friction ?? 0.4;
    const restitution = options.restitution ?? 0.3;
    const linearDamping = options.linearDamping ?? 0.3;
    const angularDamping = options.angularDamping ?? 0.3;

    let cannonShape: CANNON.Shape;

    if (shape === "box" && mesh instanceof THREE.Mesh) {
      const geometry = mesh.geometry as THREE.BoxGeometry;
      const size = new THREE.Vector3();
      geometry.computeBoundingBox();
      geometry.boundingBox?.getSize(size);
      cannonShape = new CANNON.Box(
        new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2),
      );
    } else if (shape === "sphere" && mesh instanceof THREE.Mesh) {
      const geometry = mesh.geometry as THREE.SphereGeometry;
      cannonShape = new CANNON.Sphere(geometry.parameters.radius ?? 1);
    } else if (shape === "cylinder") {
      cannonShape = new CANNON.Cylinder(0.5, 0.5, 2, 8);
    } else {
      cannonShape = new CANNON.Sphere(1);
    }

    const body = new CANNON.Body({
      mass,
      shape: cannonShape,
      linearDamping,
      angularDamping,
    });
    body.material = new CANNON.Material({ friction, restitution });

    body.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
    this.world.addBody(body);
    this.meshToBody.set(mesh, body);
    return body;
  }

  removeBody(bodyOrId: CANNON.Body | string): void {
    if (!this.world) return;

    if (typeof bodyOrId === "string") {
      const body = this.bodies.get(bodyOrId);
      if (body) {
        this.world.removeBody(body);
        this.bodies.delete(bodyOrId);
      }
    } else {
      this.world.removeBody(bodyOrId);
    }
  }

  getBody(mesh: THREE.Object3D): CANNON.Body | undefined {
    return this.meshToBody.get(mesh);
  }

  setBodyPosition(mesh: THREE.Object3D, x: number, y: number, z: number): void {
    const body = this.meshToBody.get(mesh);
    if (body) {
      body.position.set(x, y, z);
      mesh.position.set(x, y, z);
    }
  }

  setBodyVelocity(
    mesh: THREE.Object3D,
    vx: number,
    vy: number,
    vz: number,
  ): void {
    const body = this.meshToBody.get(mesh);
    body?.velocity.set(vx, vy, vz);
  }

  applyImpulse(mesh: THREE.Object3D, x: number, y: number, z: number): void {
    const body = this.meshToBody.get(mesh);
    if (body) {
      body.velocity.x += x;
      body.velocity.y += y;
      body.velocity.z += z;
    }
  }

  override update(_delta: number): void {
    super.update(_delta);
    if (!this.isPhysicsEnabled() || !this.isActive || !this.world) return;

    this.world.step(this.timeStep);

    for (const [mesh, body] of this.meshToBody.entries()) {
      if (body.mass > 0) {
        mesh.position.set(body.position.x, body.position.y, body.position.z);
        mesh.quaternion.set(
          body.quaternion.x,
          body.quaternion.y,
          body.quaternion.z,
          body.quaternion.w,
        );
      }
    }
  }

  raycast(from: THREE.Vector3, to: THREE.Vector3): CANNON.RaycastResult[] {
    if (!this.isPhysicsEnabled() || !this.cannon || !this.world) return [];

    const CANNON = this.cannon;
    const result = new CANNON.RaycastResult();
    this.world.raycastClosest(
      new CANNON.Vec3(from.x, from.y, from.z),
      new CANNON.Vec3(to.x, to.y, to.z),
      {},
      result,
    );

    return result.body ? [result] : [];
  }

  override destroy(): void {
    if (this.world) {
      for (const body of this.bodies.values()) {
        this.world.removeBody(body);
      }
    }
    this.bodies.clear();
    this.meshToBody.clear();
    this.world = null;
    this.cannon = null;
    super.destroy();
  }
}
