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
    // If sampleScene.mode === 'file' we load the resource but DO NOT add
    // the whole scene into the runtime scene. The Level system will
    // selectively instantiate children from the loaded scene resource
    // according to level config (userData.childName).
    if ((engineConfig.sampleScene as any).mode === "file") {
      // no-op: resource should already be loaded by the resource system;
      // avoid adding the entire scene to prevent duplication with LevelC
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
  const ambient = new THREE.AmbientLight(0xffffff, 0.9);
  const directional = new THREE.DirectionalLight(0xffffff, 0.9);
  directional.position.set(5, 10, 5);
  directional.target.position.set(0, 0, 0);
  directional.castShadow = true;
  directional.shadow.mapSize.width = 2048;
  directional.shadow.mapSize.height = 2048;
  directional.shadow.camera.near = 0.5;
  directional.shadow.camera.far = 50;

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
  hemi.position.set(0, 20, 0);

  scene.add(directional.target);
  core.scene.add(ambient, "base-ambient-light");
  core.scene.add(directional, "base-directional-light");
  core.scene.add(hemi, "base-hemisphere-light");
}

function _fixSceneMeshMaterials(core: ICore): void {
  core.scene.getScene().traverse((obj) => {
    if ((obj as any).isMesh) {
      const mesh = obj as THREE.Mesh;
      const name = (mesh.name || "").toLowerCase();
      const prefabId = ((mesh.userData as any)?.prefabId || "").toLowerCase();
      const isGrass = name.includes("grass") || prefabId.includes("grass");

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

        if (isGrass && material && "color" in material) {
          const mat = material as any;
          if (mat.color) {
            // brighten grass material while preserving hue
            const color = mat.color.clone();
            color.offsetHSL(0, -0.08, 0.12);
            mat.color.copy(color);
          }
          if (mat.emissive) {
            mat.emissive = mat.emissive || new THREE.Color(0x002200);
            mat.emissiveIntensity = Math.max(mat.emissiveIntensity || 0, 0.18);
          }
          if ("roughness" in mat) {
            mat.roughness = Math.min(0.8, Math.max(0.25, mat.roughness ?? 0.6));
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

  const light = new THREE.AmbientLight(0xffffff, 0.9);
  core.scene.getScene().add(light);

  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(5, 10, 5);
  dir.castShadow = true;
  dir.shadow.mapSize.width = 2048;
  dir.shadow.mapSize.height = 2048;
  dir.shadow.camera.near = 0.5;
  dir.shadow.camera.far = 50;
  core.scene.getScene().add(dir);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.35);
  hemi.position.set(0, 20, 0);
  core.scene.getScene().add(hemi);
}
