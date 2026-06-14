import type { LevelsConfig } from "@engine-types/levels";

export const levelsConfig: LevelsConfig = {
  defaultLevelId: "level_01",
  levels: [
    {
      id: "level_01",
      name: "Tutorial",
      enabled: true,
      worldId: "world_main",
      spawn: { x: 0, y: 1, z: 0 },
      objects: [
        // {
        //   index: 0,
        //   prefabId: "prefab_unknown",
        //   position: { x: 0, y: 0, z: 0 },
        //   rotation: { x: 0, y: 0, z: 0 },
        //   scale: { x: 1, y: 1, z: 1 },
        //   userData: {},
        // },
        {
          index: 1,
          prefabId: "sceneUrl",
          position: { x: 0, y: 0.5, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          name: "sceneUrl_e1et4t",
          userData: { prefabId: "sceneUrl" },
        },
      ],
    },
  ],
};

export default levelsConfig;
