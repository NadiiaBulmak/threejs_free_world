import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
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
  // try to setup environment/sky map early
  try {
    await _setupEnvironment(core);
  } catch (e) {
    // do not block lifecycle on env setup failure
    // eslint-disable-next-line no-console
    console.warn("Environment setup failed:", e);
  }
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

  // Ensure the scene has default lighting after sample scene setup.
  _ensureDefaultLighting(core);

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

async function _setupEnvironment(core: ICore): Promise<void> {
  const scene = core.scene.getScene();
  const renderer = (core.renderer as any).getRenderer
    ? (core.renderer as any).getRenderer()
    : (core.renderer as any);

  // Prefer a preloaded resource (maps resource group). Use id `env_free_jpg`.
  try {
    const loaded = (core.resources as any).get("env_free_jpg");
    if (loaded) {
      // If loader stored an HTMLImageElement
      if (typeof HTMLImageElement !== "undefined" && loaded instanceof HTMLImageElement) {
        const tex = new THREE.Texture(loaded as HTMLImageElement);
        tex.needsUpdate = true;
        try {
          (tex as any).encoding = (THREE as any).sRGBEncoding;
        } catch (_) {}
        const pmrem = new THREE.PMREMGenerator(renderer);
        pmrem.compileEquirectangularShader();
        const envMap = pmrem.fromEquirectangular(tex).texture;
        scene.environment = envMap;
        scene.background = tex as any;
        pmrem.dispose();
        return;
      }

      // If loader stored a three.js Texture
      if ((loaded as any) && (loaded as any).isTexture) {
        const tex = loaded as THREE.Texture;
        try {
          (tex as any).encoding = (THREE as any).sRGBEncoding;
        } catch (_) {}
        try {
          const pmrem = new THREE.PMREMGenerator(renderer);
          pmrem.compileEquirectangularShader();
          const envMap = pmrem.fromEquirectangular(tex).texture;
          scene.environment = envMap;
          scene.background = envMap;
          pmrem.dispose();
          console.info("Environment applied from resource (PMREM)");
          return;
        } catch (e) {
          console.warn("PMREM apply failed for env resource, falling back to direct background:", e);
          try {
            tex.mapping = (THREE as any).EquirectangularReflectionMapping || (THREE as any).EquirectangularReflectionMapping;
          } catch (_) {}
          scene.background = tex as any;
          // Do not set scene.environment if PMREM failed; leave as null
          return;
        }
      }
    }
  } catch (e) {
    // ignore and fall back to URL-based loading
  }

  // Prefer HDR (.hdr/.exr) using RGBELoader + PMREM, fallback to JPG texture
  const tryHdr = async (path: string) => {
    let tex: any;
    if (path.toLowerCase().endsWith(".exr")) {
      const exr = new EXRLoader();
      tex = await exr.loadAsync(path);
    } else {
      const loader = new RGBELoader();
      tex = await loader.loadAsync(path);
    }
    // Protect against extremely large environment images that exceed GPU limits
    try {
      const maxSize = (renderer && (renderer.capabilities as any)?.maxTextureSize) ||
        (renderer && (renderer.getContext && renderer.getContext().getParameter(renderer.getContext().MAX_TEXTURE_SIZE))) ||
        4096;
      const img = (tex as any).image || {};
      const w = img.width || img.WIDTH || (tex as any).width || 0;
      const h = img.height || img.HEIGHT || (tex as any).height || 0;
      if (w > maxSize || h > maxSize) {
        // Dispose and fail so caller can try a smaller candidate
        try { (tex as any).dispose && (tex as any).dispose(); } catch (_) {}
        throw new Error(`Environment image too large: ${w}x${h} (max ${maxSize})`);
      }
    } catch (e) {
      // rethrow so outer loop will try next candidate
      throw e;
    }
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envMap = pmrem.fromEquirectangular(tex).texture;
    scene.environment = envMap;
    scene.background = envMap;
    tex.dispose();
    pmrem.dispose();
    return true;
  };

  const tryJpg = (path: string) =>
    new Promise<void>((resolve) => {
      const loader = new THREE.TextureLoader();
      loader.load(path, (tex) => {
        try {
          try {
            (tex as any).encoding = (THREE as any).sRGBEncoding;
          } catch (_) {
            /* ignore if typings differ */
          }
        } catch (_) {}
        scene.background = tex as any;
        resolve();
      });
    });

  // List of candidate maps (prefer hdr/exr then jpg)
  const candidates = [
    new URL("../../resources/maps/791-hdri-skies-com.hdr", import.meta.url).href,
    new URL("../../resources/maps/144_hdrmaps_com_free_1K.exr", import.meta.url).href,
    new URL("../../resources/maps/free_hdri_sky_791_.jpg", import.meta.url).href,
  ];

  for (const c of candidates) {
    try {
      if (c.endsWith(".hdr") || c.endsWith(".exr")) {
        // try HDR via RGBELoader (RGBELoader also supports .exr in some setups)
        // If it fails, continue to next candidate
        // eslint-disable-next-line no-await-in-loop
        await tryHdr(c);
        // success
        return;
      } else {
        // eslint-disable-next-line no-await-in-loop
        await tryJpg(c);
        return;
      }
    } catch (e) {
      // try next
      // eslint-disable-next-line no-console
      console.warn("Env map candidate failed:", c, e);
    }
  }
}

function _ensureDefaultLighting(core: ICore): void {
  const scene = core.scene.getScene();
  let hasLight = false;
  scene.traverse((child) => {
    if (child.type.endsWith("Light")) {
      hasLight = true;
    }
  });

  if (hasLight) return;

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(5, 10, 5);

  core.scene.add(ambient, "default-ambient-light");
  core.scene.add(directional, "default-directional-light");
}

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
