import type { ResourceGroup } from "@engine-types/resources";

const sceneUrl = new URL("../../resources/meshes/Scene.glb", import.meta.url)
  .href;

export const meshResources: ResourceGroup = {
  items: [{ id: "scene", url: sceneUrl }],
  loader: "mesh",
};

export default meshResources;
