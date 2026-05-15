import * as THREE from "three";
import type { ICore } from "@engine-types/core";
import { engineConfig } from "@config/engine.config";

export async function beforeResourceLoaded(_core: ICore): Promise<void> {
  // Підготовка перед завантаженням ресурсів
}

export async function afterResourceLoaded(core: ICore): Promise<void> {
  if (engineConfig.sampleScene.enabled) {
    _setupSampleScene(core);
  }
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

  const light = new THREE.AmbientLight(0xffffff, 0.6);
  core.scene.getScene().add(light);

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 10, 5);
  core.scene.getScene().add(dir);
}
