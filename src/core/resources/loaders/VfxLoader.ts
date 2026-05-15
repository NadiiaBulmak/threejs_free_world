import type { ResourceItem } from "@engine-types/resources";
import type { ResourceC } from "../ResourceC";
import type { IResourceLoader } from "./IResourceLoader";

export class VfxResourceLoader implements IResourceLoader {
  async load(item: ResourceItem, resources: ResourceC): Promise<void> {
    const response = await fetch(item.url);
    if (!response.ok) {
      throw new Error(`Failed to load VFX "${item.id}": ${response.statusText}`);
    }
    const data = await response.json();
    resources.set(item.id, data);
  }
}
