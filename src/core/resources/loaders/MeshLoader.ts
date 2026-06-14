import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { ResourceItem } from "@engine-types/resources";
import type { ResourceC } from "../ResourceC";
import type { IResourceLoader } from "./IResourceLoader";

export class MeshResourceLoader implements IResourceLoader {
  private gltfLoader = new GLTFLoader();

  private prepareLoadedMesh(object: THREE.Object3D): void {
    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.frustumCulled = false;

        const applyDoubleSide = (
          material: THREE.Material | THREE.Material[],
        ) => {
          if (Array.isArray(material)) {
            material.forEach(applyDoubleSide);
            return;
          }
          if (material && "side" in material) {
            material.side = THREE.DoubleSide;
          }
        };

        if (mesh.material) {
          applyDoubleSide(mesh.material);
        }
      }
    });
  }

  async load(item: ResourceItem, resources: ResourceC): Promise<void> {
    const url = item.url.toLowerCase();
    if (url.endsWith(".glb") || url.endsWith(".gltf")) {
      const gltf = await this.gltfLoader.loadAsync(item.url);
      this.prepareLoadedMesh(gltf.scene);
      resources.set(item.id, gltf.scene);
      return;
    }

    const objLoader = new THREE.ObjectLoader();
    const object = await objLoader.loadAsync(item.url);
    this.prepareLoadedMesh(object);
    resources.set(item.id, object);
  }
}
