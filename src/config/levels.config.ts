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
      "index": 6,
      "prefabId": "Mesh1005",
      "position": {
        "x": 1.723085623392277,
        "y": 7.843337532345809,
        "z": -2.561490429831098
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
      "name": "Mesh1005_kpgabz",
      "userData": {
        "name": "Mesh1.005",
        "prefabId": "Mesh1005"
      }
    },
    {
      "index": 7,
      "prefabId": "Mesh_0",
      "position": {
        "x": 2.603459115734338,
        "y": 0,
        "z": 1.0354553059982177
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
      "name": "Mesh_0_kph60r",
      "userData": {
        "name": "Mesh_0",
        "prefabId": "Mesh_0"
      }
    },
    {
      "index": 8,
      "prefabId": "Grass_small_3",
      "position": {
        "x": 5.459101566809613,
        "y": 0,
        "z": 2.768409327422992
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
      "name": "Grass_small_3_kpha2z",
      "userData": {
        "name": "Grass_small_3",
        "prefabId": "Grass_small_3"
      }
}
      ],
    },
  ],
};

export default levelsConfig;
