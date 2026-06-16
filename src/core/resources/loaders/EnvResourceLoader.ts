import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import type { IResourceLoader } from "./IResourceLoader";
import type { ResourceItem } from "@engine-types/resources";
import type { ResourceC } from "../ResourceC";

export class EnvResourceLoader implements IResourceLoader {
  private texLoader = new THREE.TextureLoader();
  private rgbe = new RGBELoader();
  private exr = new EXRLoader();

  async load(item: ResourceItem, resources: ResourceC): Promise<void> {
    const url = item.url;
    const lower = url.toLowerCase();
    try {
      if (lower.endsWith(".hdr")) {
        const tex = await this.rgbe.loadAsync(url) as any;
        // RGBELoader returns a data texture suitable for PMREM
        resources.set(item.id, tex as THREE.Texture);
        return;
      }

      if (lower.endsWith(".exr")) {
        const tex = await this.exr.loadAsync(url) as any;
        resources.set(item.id, tex as THREE.Texture);
        return;
      }

      // fallback to standard texture loader for jpg/png
      const tex = await this.texLoader.loadAsync(url);
      resources.set(item.id, tex);
    } catch (e) {
      // rethrow so LoaderC can surface failures
      throw e;
    }
  }
}

export default EnvResourceLoader;
