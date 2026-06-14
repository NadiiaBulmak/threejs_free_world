import * as THREE from "three";
import type { ICore } from "@engine-types/core";
import { engineConfig } from "@config/engine.config";
import { levelsConfig } from "@config/levels.config";
import { LevelC } from "../../game/level/LevelC";
import { EditorC } from "../../game/editor/EditorC";
// import EditorUI from "src/game/editor/EditorUI";
import { EditorUI } from "../../game/editor/EditorUI";

export async function beforeResourceLoaded(_core: ICore): Promise<void> {
  // Підготовка перед завантаженням ресурсів
}

export async function afterResourceLoaded(core: ICore): Promise<void> {
  if (engineConfig.sampleScene.enabled) {
    // Support loading the sample scene from a resource file (as-is)
    if ((engineConfig.sampleScene as any).mode === "file") {
      try {
        // load scene resource named 'scene' and add it unchanged
        if (
          core.scene &&
          typeof (core.scene as any).addSceneFromResource === "function"
        ) {
          (core.scene as any).addSceneFromResource("scene", "scene");
        } else {
          _setupSampleScene(core);
        }
      } catch (e) {
        console.warn("Failed to load scene from resource, falling back:", e);
        _setupSampleScene(core);
      }
    } else {
      _setupSampleScene(core);
    }
  }

  // Try to load default level if levels config present
  try {
    if (levelsConfig && levelsConfig.defaultLevelId) {
      const levelC = new LevelC(core);
      // load default level if enabled
      await levelC.loadLevel(levelsConfig.defaultLevelId);
    }
  } catch (e) {
    // don't break lifecycle on level errors
    // eslint-disable-next-line no-console
    console.warn("Level loading failed:", e);
  }

  // Ensure the scene has default base lighting after sample scene setup.
  _setupBaseLighting(core);
  _fixSceneMeshMaterials(core);
  // _setupEnvironmentMap(core);

  // Editor (dev) — instantiate if enabled or ?editor=1
  try {
    const urlParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const editorRequested = urlParams ? urlParams.has("editor") : false;
    if ((engineConfig as any).editor?.enabled || editorRequested) {
      const editorC = new EditorC(core);
      // UI attaches itself to DOM
      /* eslint-disable no-new */
      new EditorUI(core, editorC);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Editor initialization failed:", e);
  }
}

function _setupBaseLighting(core: ICore): void {
  const scene = core.scene.getScene();
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(5, 10, 5);
  directional.target.position.set(0, 0, 0);

  scene.add(directional.target);
  core.scene.add(ambient, "base-ambient-light");
  core.scene.add(directional, "base-directional-light");
}

function _fixSceneMeshMaterials(core: ICore): void {
  core.scene.getScene().traverse((obj) => {
    if ((obj as any).isMesh) {
      const mesh = obj as THREE.Mesh;

      const applyToMaterial = (material: THREE.Material | THREE.Material[]) => {
        if (Array.isArray(material)) {
          material.forEach(applyToMaterial);
          return;
        }

        if (material && "side" in material) {
          material.side = THREE.DoubleSide;
          if (!material.transparent) {
            material.transparent = false;
            material.opacity = 1;
          }
        }
      };

      if (mesh.material) {
        applyToMaterial(mesh.material);
      }
    }
  });
}

// function _setupEnvironmentMap(core: ICore): void {
//   const loader = new THREE.TextureLoader();
//   const textureUrl = new URL(
//     "../../resources/maps/free_hdri_sky_791_.jpg",
//     import.meta.url,
//   ).href;
//   loader.load(
//     textureUrl,
//     (texture) => {
//       texture.encoding = THREE.sRGBEncoding;
//       texture.mapping = THREE.EquirectangularReflectionMapping;

//       const scene = core.scene.getScene();
//       scene.background = texture;
//       scene.environment = texture;

//       const size = 5000;
//       const envBox = new THREE.Mesh(
//         new THREE.BoxGeometry(size, size, size),
//         new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }),
//       );
//       envBox.name = "environment-box";
//       scene.add(envBox);
//     },
//     undefined,
//     (error) => {
//       console.warn("Failed to load environment map:", error);
//     },
//   );
// }

function _setupSampleScene(core: ICore): void {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x2a2a2a }),
  );
  ground.rotation.x = -Math.PI / 2;
  core.scene.add(ground, "ground");

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x4a9eff }),
  );
  cube.position.set(0, 0.5, 0);
  core.scene.add(cube, "sample-cube");

  const light = new THREE.AmbientLight(0xffffff, 0.6);
  core.scene.getScene().add(light);

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 10, 5);
  core.scene.getScene().add(dir);
}
