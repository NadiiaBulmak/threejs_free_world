import type { ResourceGroup } from "@engine-types/resources";

// const sceneUrl = new URL("../../resources/meshes/Character_updated.glb", import.meta.url)
//   .href;

const grassUrl = new URL("../../resources/meshes/Grass_1.glb", import.meta.url)
  .href;
const grassUrl2 = new URL("../../resources/meshes/grass-block.glb", import.meta.url)
  .href;

export const meshResources: ResourceGroup = {
  items: [
    // { id: "scene", url: sceneUrl }, 
    { id: "grass", url: grassUrl },
    { id: "grass_2", url: grassUrl2 },
  ],
  loader: "mesh",
};

export default meshResources;

