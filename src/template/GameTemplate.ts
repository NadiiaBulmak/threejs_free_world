import type { ICore } from "@engine-types/core";
import {
  beforeResourceLoaded,
  afterResourceLoaded,
} from "./callbacks/lifecycle.callbacks";
import { onResize } from "./callbacks/resize.callbacks";
import { onFirstClick } from "./callbacks/firstClick.callbacks";
import { registerUpdateDelegates } from "./callbacks/update.callbacks";

export class GameTemplate {
  constructor(private core: ICore) {}

  async runBeforeLoad(): Promise<void> {
    await beforeResourceLoaded(this.core);
  }

  async runAfterLoad(): Promise<void> {
    await afterResourceLoaded(this.core);
  }

  bindCallbacks(): void {
    this.core.resize.onResize((width, height) => {
      onResize(this.core, width, height);
    });

    this.core.input.onFirstClick(() => {
      onFirstClick(this.core);
      this.core.events.emit("firstClick");
    });

    registerUpdateDelegates(this.core);
  }
}
