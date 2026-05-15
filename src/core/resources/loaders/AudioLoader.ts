import type { ResourceItem } from "@engine-types/resources";
import type { ResourceC } from "../ResourceC";
import type { IResourceLoader } from "./IResourceLoader";

export class AudioResourceLoader implements IResourceLoader {
  async load(item: ResourceItem, resources: ResourceC): Promise<void> {
    const audio = new Audio(item.url);
    audio.preload = "auto";
    await new Promise<void>((resolve, reject) => {
      audio.addEventListener("canplaythrough", () => resolve(), { once: true });
      audio.addEventListener("error", reject, { once: true });
      audio.load();
    });
    resources.set(item.id, audio);
  }
}
