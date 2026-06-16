import { BaseC } from "../base/BaseC";
import type { ICore } from "@engine-types/core";
import type { LoaderKind, ResourceGroup, ResourceItem } from "@engine-types/resources";
import type { IResourceLoader } from "./loaders/IResourceLoader";
import { TextureResourceLoader } from "./loaders/TextureLoader";
import { ImageResourceLoader } from "./loaders/ImageLoader";
import { AudioResourceLoader } from "./loaders/AudioLoader";
import { MeshResourceLoader } from "./loaders/MeshLoader";
import { VfxResourceLoader } from "./loaders/VfxLoader";
import type { ResourceC } from "./ResourceC";
import EnvResourceLoader from "./loaders/EnvResourceLoader";

export class LoaderC extends BaseC {
  private loaders: Map<LoaderKind, IResourceLoader>;
  private resources: ResourceC;

  constructor(core: ICore, resources: ResourceC) {
    super(core);
    this.resources = resources;
    this.loaders = new Map<LoaderKind, IResourceLoader>([
      ["texture", new TextureResourceLoader()],
      ["image", new ImageResourceLoader()],
      ["env", new EnvResourceLoader()],
      ["audio", new AudioResourceLoader()],
      ["mesh", new MeshResourceLoader()],
      ["vfx", new VfxResourceLoader()],
    ]);
  }

  async loadItem(item: ResourceItem, loaderKind: LoaderKind): Promise<void> {
    const loader = this.loaders.get(loaderKind);
    if (!loader) {
      throw new Error(`Unknown loader kind: ${loaderKind}`);
    }
    await loader.load(item, this.resources);
  }

  async loadGroup(group: ResourceGroup): Promise<void> {
    await Promise.all(
      group.items.map((item) => this.loadItem(item, group.loader)),
    );
  }

  async loadAll(groups: ResourceGroup[]): Promise<void> {
    await Promise.all(groups.map((group) => this.loadGroup(group)));
  }
}
