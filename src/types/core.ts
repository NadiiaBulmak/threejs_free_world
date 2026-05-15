import type { GameLoopC } from "@core/loop/GameLoopC";
import type { TimeC } from "@core/loop/TimeC";
import type { SceneC } from "@core/scene/SceneC";
import type { CameraC } from "@core/scene/CameraC";
import type { OrbitC } from "@core/scene/OrbitC";
import type { RendererC } from "@core/scene/RendererC";
import type { EventBusC } from "@core/events/EventBusC";
import type { InputC } from "@core/input/InputC";
import type { ResizeC } from "@core/resize/ResizeC";
import type { ResourceC } from "@core/resources/ResourceC";
import type { LoaderC } from "@core/resources/LoaderC";
import type { PhysicsC } from "@core/physics/PhysicsC";
import type { MoveC } from "@core/character/MoveC";
import type { RotateC } from "@core/character/RotateC";

export interface ICore {
  canvas: HTMLCanvasElement;

  scene: SceneC;
  camera: CameraC;
  orbit: OrbitC;
  renderer: RendererC;

  gameLoop: GameLoopC;
  time: TimeC;

  input: InputC;
  events: EventBusC;
  resize: ResizeC;

  resources: ResourceC;
  loader: LoaderC;
  physics: PhysicsC;

  move: MoveC;
  rotate: RotateC;

  init(): Promise<void>;
  start(): void;
  stop(): void;
  destroy(): void;
}

export type UpdateDelegate = (delta: number) => void;
export type EventCallback = (data?: unknown) => void;
export type ResizeCallback = (width: number, height: number) => void;
