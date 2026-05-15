import type { ResourceItem } from "@engine-types/resources";
import type { ResourceC } from "../ResourceC";
import type { IResourceLoader } from "./IResourceLoader";

export class ImageResourceLoader implements IResourceLoader {
  async load(item: ResourceItem, resources: ResourceC): Promise<void> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = item.url;
    });
    resources.set(item.id, image);
  }
}
