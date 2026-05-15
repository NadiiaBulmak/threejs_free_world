import type { ICore } from "@engine-types/core";

export function onResize(core: ICore, width: number, height: number): void {
  core.camera.applyOrientationConfig(width, height);
}
