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
    //   "index": 0,
    //   "prefabId": "prefab_unknown",
    //   "position": {
    //     "x": 0,
    //     "y": 0,
    //     "z": 0
    //   },
    //   "rotation": {
    //     "x": 0,
    //     "y": 0,
    //     "z": 0
    //   },
    //   "scale": {
    //     "x": 1,
    //     "y": 1,
    //     "z": 1
    //   },
    //   "userData": {}
    // },
    // {
    //   "index": 1,
    //   "prefabId": "prefab_unknown",
    //   "position": {
    //     "x": 0,
    //     "y": 0,
    //     "z": 0
    //   },
    //   "rotation": {
    //     "x": 0,
    //     "y": 0,
    //     "z": 0
    //   },
    //   "scale": {
    //     "x": 1,
    //     "y": 1,
    //     "z": 1
    //   },
    //   "userData": {}
    // },
    {
      "index": 2,
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
      "prefabId": "Characterglb",
      "position": {
        "x": -0.3052297160955759,
        "y": 0.5,
        "z": 3.53103888882737
      },
      "rotation": {
        "x": 0,
        "y": 0,
        "z": 0
      },
      "scale": {
        "x": 0.5736947377111108,
        "y": 0.5736947377111108,
        "z": 0.5736947377111108
      },
      "name": "Characterglb_fdouml",
      "userData": {
        "name": "Character.glb",
        "prefabId": "Characterglb"
      }
    }
  ]
}    
  ],
};

export default levelsConfig;
