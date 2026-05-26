import { BaseC } from "../base/BaseC";
import { GameLoopC } from "../loop/GameLoopC";
import { TimeC } from "../loop/TimeC";
import { SceneC } from "../scene/SceneC";
import { CameraC } from "../scene/CameraC";
import { OrbitC } from "../scene/OrbitC";
import { RendererC } from "../scene/RendererC";
import { EventBusC } from "../events/EventBusC";
import { InputC } from "../input/InputC";
import { ResizeC } from "../resize/ResizeC";
import { ResourceC } from "../resources/ResourceC";
import { LoaderC } from "../resources/LoaderC";
import { PhysicsC } from "../physics/PhysicsC";
import { MoveC } from "../character/MoveC";
import { RotateC } from "../character/RotateC";
import { GameTemplate } from "@template/GameTemplate";
import { allResourceGroups } from "@config/resources";
import { engineConfig } from "@config/engine.config";
import type { ICore } from "@engine-types/core";

export class InitC extends BaseC implements ICore {
  public scene!: SceneC;
  public camera!: CameraC;
  public orbit!: OrbitC;
  public renderer!: RendererC;

  public gameLoop!: GameLoopC;
  public time!: TimeC;

  public input!: InputC;
  public events!: EventBusC;
  public resize!: ResizeC;

  public resources!: ResourceC;
  public loader!: LoaderC;
  public physics!: PhysicsC;

  public move!: MoveC;
  public rotate!: RotateC;

  public canvas: HTMLCanvasElement;

  private isInitialized = false;
  private template!: GameTemplate;

  constructor(canvas: HTMLCanvasElement) {
    super({} as ICore);
    this.core = this;
    this.canvas = canvas;
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;

    this.renderer = new RendererC(this, this.canvas);
    this.time = new TimeC(this);
    this.gameLoop = new GameLoopC(this);
    this.events = new EventBusC(this);

    this.scene = new SceneC(this);
    this.camera = new CameraC(this);
    this.orbit = new OrbitC(this);
    this.resize = new ResizeC(this);
    this.resize.apply();
    this.physics = new PhysicsC(this);
    if (!engineConfig.physics.enabled) {
      this.physics.disable();
    }

    this.input = new InputC(this);
    this.move = new MoveC(this);
    this.rotate = new RotateC(this);

    this.resources = new ResourceC(this);
    this.loader = new LoaderC(this, this.resources);

    this.template = new GameTemplate(this);
    await this.template.runBeforeLoad();

    const hasResources = allResourceGroups.some((g) => g.items.length > 0);
    if (hasResources) {
      await this.loader.loadAll(allResourceGroups);
    }

    await this.template.runAfterLoad();
    this.scene.init();
    this.template.bindCallbacks();

    this.gameLoop.registerUpdateController(this.time);

    this.isInitialized = true;
  }

  start(): void {
    if (!this.isInitialized) {
      console.error("Engine must be initialized before start()");
      return;
    }
    this.gameLoop.start();
  }

  stop(): void {
    this.gameLoop.stop();
  }

  destroy(): void {
    this.gameLoop.destroy();
    this.orbit.destroy();
    this.renderer.destroy();
    this.scene.destroy();
    this.physics.destroy();
    this.input.destroy();
    this.resources.destroy();
    this.isInitialized = false;
  }
}
