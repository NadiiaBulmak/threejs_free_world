import * as THREE from "three";
import { DisposableC } from "../base/DisposableC";
import { engineConfig } from "../../config/engine.config";
import type { ICore } from "@engine-types/core";

/**
 * RendererC - WebGL renderer controller.
 */
export class RendererC extends DisposableC {
  private renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;

  constructor(core: ICore, canvas?: HTMLCanvasElement) {
    super(core);
    this.canvas = canvas ?? document.createElement("canvas");

    const { antialias, powerPreference, clearColor, pixelRatio } =
      engineConfig.renderer;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias,
      alpha: false,
      powerPreference,
    });

    const ratio =
      pixelRatio === "auto"
        ? Math.min(window.devicePixelRatio, 2)
        : pixelRatio;
    this.renderer.setPixelRatio(ratio);
    this.renderer.setClearColor(clearColor, 1);
    this.renderer.shadowMap.enabled = false;

    this.trackDisposable(this.renderer);
  }

  setSize(width: number, height: number): void {
    this.renderer.setSize(width, height, false);
  }

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  enableShadows(): void {
    this.renderer.shadowMap.enabled = true;
  }

  setToneMapping(type: "linear" | "reinhard" | "aces" = "linear"): void {
    const mappings: Record<string, THREE.ToneMapping> = {
      linear: THREE.LinearToneMapping,
      reinhard: THREE.ReinhardToneMapping,
      aces: THREE.ACESFilmicToneMapping,
    };
    this.renderer.toneMapping = mappings[type] ?? THREE.LinearToneMapping;
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer.render(scene, camera);
  }

  override destroy(): void {
    this.renderer.dispose();
    super.destroy();
  }
}
