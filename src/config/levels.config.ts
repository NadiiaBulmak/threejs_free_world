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
    {
      "index": 0,
      "prefabId": "grass-blockglb",
      "position": {
        "x": -0.08557549539281598,
        "y": 0,
        "z": 2.9279553629727104
      },
      "rotation": {
        "x": 0,
        "y": 0,
        "z": 0
      },
      "scale": {
        "x": 0.01632965931641105,
        "y": 0.01632965931641105,
        "z": 0.01632965931641105
      },
      "name": "grass-blockglb_fdosx1",
      "userData": {
        "name": "grass-block.glb",
        "prefabId": "grass-blockglb"
      }
    },
    {
      "index": 3,
      "prefabId": "Char_with_animglb",
      "position": {
        "x": -0.2799558280804865,
        "y": 0.4,
        "z": 3.5918666677538442
      },
      "rotation": {
        "x": 0,
        "y": 0,
        "z": 0
      },
      "scale": {
        "x": 1,
        "y": 1,
        "z": 1
      },
      "name": "Char_with_animglb_gyffy4",
      "userData": {
        "name": "Char_with_anim.glb",
        "prefabId": "Char_with_animglb"
      }
    }
      ],
    },
  ],
};

export default levelsConfig;
