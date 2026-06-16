import type { ResourceGroup } from "@engine-types/resources";

const sceneUrl = new URL("../../resources/meshes/scene.glb", import.meta.url)
  .href;

// const grassUrl = new URL("../../resources/meshes/Grass_1.glb", import.meta.url)
//   .href;
// const grassUrl2 = new URL("../../resources/meshes/grass-block.glb", import.meta.url)
//   .href;

export const meshResources: ResourceGroup = {
  items: [
    // The primary scene resource is exposed as `scene` so other systems
    // (SceneC, EditorC, LevelC) can reference it by a stable id.
    { id: "scene", url: sceneUrl },
    // { id: "grass", url: grassUrl },
    // { id: "grass_2", url: grassUrl2 },
  ],
  loader: "mesh",
};

export default meshResources;

