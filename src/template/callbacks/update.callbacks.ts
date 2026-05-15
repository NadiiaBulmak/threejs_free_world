import type { ICore } from "@engine-types/core";

export function registerUpdateDelegates(core: ICore): void {
  core.gameLoop.addUpdateDelegate((delta) => core.input.update(delta), 10);
  core.gameLoop.addUpdateDelegate((delta) => core.orbit.update(delta), 15);
  core.gameLoop.addUpdateDelegate((delta) => core.physics.update(delta), 20);
  core.gameLoop.addUpdateDelegate((delta) => core.move.update(delta), 30);
  core.gameLoop.addUpdateDelegate((delta) => core.rotate.update(delta), 40);
}
