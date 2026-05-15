import * as THREE from "three";
import type { ResourceItem } from "@engine-types/resources";
import type { ResourceC } from "../ResourceC";
import type { IResourceLoader } from "./IResourceLoader";

export class TextureResourceLoader implements IResourceLoader {
  private loader = new THREE.TextureLoader();

  async load(item: ResourceItem, resources: ResourceC): Promise<void> {
    const texture = await this.loader.loadAsync(item.url);
    resources.set(item.id, texture);
  }
}
