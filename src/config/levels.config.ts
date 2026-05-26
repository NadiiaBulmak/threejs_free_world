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
      ],
    },
  ],
};

export default levelsConfig;
