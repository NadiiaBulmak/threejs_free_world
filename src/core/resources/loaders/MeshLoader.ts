import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { ResourceItem } from "@engine-types/resources";
import type { ResourceC } from "../ResourceC";
import type { IResourceLoader } from "./IResourceLoader";

export class MeshResourceLoader implements IResourceLoader {
  private gltfLoader = new GLTFLoader();

  async load(item: ResourceItem, resources: ResourceC): Promise<void> {
    const url = item.url.toLowerCase();
    if (url.endsWith(".glb") || url.endsWith(".gltf")) {
      const gltf = await this.gltfLoader.loadAsync(item.url);
      resources.set(item.id, gltf.scene);
      return;
    }

    const objLoader = new THREE.ObjectLoader();
    const object = await objLoader.loadAsync(item.url);
    resources.set(item.id, object);
  }
}
