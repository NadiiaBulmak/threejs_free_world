import { musicResources } from "./music.resources";
import { meshResources } from "./meshes.resources";
import { imageResources } from "./images.resources";
import { textureResources } from "./textures.resources";
import { vfxResources } from "./vfx.resources";
import type { ResourceGroup } from "@engine-types/resources";

export const allResourceGroups: ResourceGroup[] = [
  musicResources,
  meshResources,
  imageResources,
  textureResources,
  vfxResources,
];

export {
  musicResources,
  meshResources,
  imageResources,
  textureResources,
  vfxResources,
};
