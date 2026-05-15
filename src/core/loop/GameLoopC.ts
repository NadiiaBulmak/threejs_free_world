import { BaseC } from "../base/BaseC";
import { UpdateBaseC } from "../base/UpdateBaseC";
import type { ICore, UpdateDelegate } from "@engine-types/core";

interface DelegateEntry {
  fn: UpdateDelegate;
  priority: number;
}

export class GameLoopC extends BaseC {
  private updateControllers: UpdateBaseC[] = [];
  private updateDelegates: DelegateEntry[] = [];
  private animationId: number | null = null;
  private isRunning = false;

  constructor(core: ICore) {
    super(core);
  }

  registerUpdateController(controller: UpdateBaseC): void {
    this.updateControllers.push(controller);
  }

  addUpdateDelegate(fn: UpdateDelegate, priority = 100): void {
    this.updateDelegates.push({ fn, priority });
    this.updateDelegates.sort((a, b) => a.priority - b.priority);
  }

  removeUpdateDelegate(fn: UpdateDelegate): void {
    this.updateDelegates = this.updateDelegates.filter((d) => d.fn !== fn);
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;

    this.animationId = requestAnimationFrame(this.tick);

    this.core.time.update(0);
    const delta = this.core.time.getDelta();

    for (const controller of this.updateControllers) {
      if (controller === this.core.time) continue;
      controller.update(delta);
    }

    for (const { fn } of this.updateDelegates) {
      fn(delta);
    }

    this.core.renderer.render(
      this.core.scene.getScene(),
      this.core.camera.getCamera(),
    );
  };

  override destroy(): void {
    this.stop();
    this.updateControllers = [];
    this.updateDelegates = [];
  }
}
