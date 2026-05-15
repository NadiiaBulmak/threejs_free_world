import { UpdateBaseC } from "../base/UpdateBaseC";
import type { ICore } from "@engine-types/core";

export type DragCallback = (data: {
  start: { x: number; y: number };
  current: { x: number; y: number };
  delta: { x: number; y: number };
}) => void;

export type FirstClickCallback = () => void;

export class InputC extends UpdateBaseC {
  private keys = new Map<string, boolean>();
  private mouseButtons = new Map<number, boolean>();
  private mousePosition = { x: 0, y: 0 };
  private mouseDelta = { x: 0, y: 0 };
  private lastMousePosition = { x: 0, y: 0 };

  private isDragging = false;
  private dragStart = { x: 0, y: 0 };
  private dragCurrent = { x: 0, y: 0 };
  private dragDelta = { x: 0, y: 0 };

  private dragStartCallbacks: DragCallback[] = [];
  private dragCallbacks: DragCallback[] = [];
  private dragEndCallbacks: DragCallback[] = [];
  private firstClickCallbacks: FirstClickCallback[] = [];
  private firstClickFired = false;

  private canvas: HTMLCanvasElement;
  private boundPointerDown: (e: PointerEvent) => void;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;

  constructor(core: ICore) {
    super(core);
    this.canvas = core.canvas;
    this.boundPointerDown = (e) => this._onPointerDown(e);
    this.boundPointerMove = (e) => this._onPointerMove(e);
    this.boundPointerUp = (e) => this._onPointerUp(e);
    this._setupListeners();
  }

  private _setupListeners(): void {
    window.addEventListener("keydown", (e) => this.keys.set(e.code, true));
    window.addEventListener("keyup", (e) => this.keys.set(e.code, false));

    window.addEventListener("mousedown", (e) => this.mouseButtons.set(e.button, true));
    window.addEventListener("mouseup", (e) => this.mouseButtons.set(e.button, false));
    window.addEventListener("mousemove", (e) => this._updateMousePosition(e.clientX, e.clientY));

    this.canvas.addEventListener("pointerdown", this.boundPointerDown);
    this.canvas.addEventListener("pointermove", this.boundPointerMove);
    this.canvas.addEventListener("pointerup", this.boundPointerUp);
    this.canvas.addEventListener("pointercancel", this.boundPointerUp);
  }

  private _onPointerDown(e: PointerEvent): void {
    if (!this.firstClickFired) {
      this.firstClickFired = true;
      for (const cb of this.firstClickCallbacks) {
        try {
          cb();
        } catch (err) {
          console.error("Error in firstClick callback:", err);
        }
      }
    }

    this.isDragging = true;
    this.dragStart.x = e.clientX;
    this.dragStart.y = e.clientY;
    this.dragCurrent.x = e.clientX;
    this.dragCurrent.y = e.clientY;
    this.dragDelta.x = 0;
    this.dragDelta.y = 0;
    this._emitDrag(this.dragStartCallbacks);
  }

  private _onPointerMove(e: PointerEvent): void {
    this._updateMousePosition(e.clientX, e.clientY);
    if (!this.isDragging) return;

    this.dragCurrent.x = e.clientX;
    this.dragCurrent.y = e.clientY;
    this.dragDelta.x = this.dragCurrent.x - this.dragStart.x;
    this.dragDelta.y = this.dragCurrent.y - this.dragStart.y;
    this._emitDrag(this.dragCallbacks);
  }

  private _onPointerUp(_e: PointerEvent): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this._emitDrag(this.dragEndCallbacks);
    this.dragDelta.x = 0;
    this.dragDelta.y = 0;
  }

  private _updateMousePosition(x: number, y: number): void {
    this.lastMousePosition.x = this.mousePosition.x;
    this.lastMousePosition.y = this.mousePosition.y;
    this.mousePosition.x = x;
    this.mousePosition.y = y;
    this.mouseDelta.x = this.mousePosition.x - this.lastMousePosition.x;
    this.mouseDelta.y = this.mousePosition.y - this.lastMousePosition.y;
  }

  private _emitDrag(callbacks: DragCallback[]): void {
    const payload = {
      start: { ...this.dragStart },
      current: { ...this.dragCurrent },
      delta: { ...this.dragDelta },
    };
    for (const cb of callbacks) {
      try {
        cb(payload);
      } catch (err) {
        console.error("Error in drag callback:", err);
      }
    }
  }

  isKeyPressed(code: string): boolean {
    return this.keys.get(code) ?? false;
  }

  isMouseDown(button = 0): boolean {
    return this.mouseButtons.get(button) ?? false;
  }

  getIsDragging(): boolean {
    return this.isDragging;
  }

  getDragStart(): { x: number; y: number } {
    return { ...this.dragStart };
  }

  getDragCurrent(): { x: number; y: number } {
    return { ...this.dragCurrent };
  }

  getDragDelta(): { x: number; y: number } {
    return { ...this.dragDelta };
  }

  getMousePosition(): { x: number; y: number } {
    return { ...this.mousePosition };
  }

  getMouseDelta(): { x: number; y: number } {
    return { ...this.mouseDelta };
  }

  onDragStart(callback: DragCallback): void {
    this.dragStartCallbacks.push(callback);
  }

  onDrag(callback: DragCallback): void {
    this.dragCallbacks.push(callback);
  }

  onDragEnd(callback: DragCallback): void {
    this.dragEndCallbacks.push(callback);
  }

  onFirstClick(callback: FirstClickCallback): void {
    this.firstClickCallbacks.push(callback);
  }

  override update(_delta: number): void {
    super.update(_delta);
    if (!this.isActive) return;
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
  }

  override destroy(): void {
    this.canvas.removeEventListener("pointerdown", this.boundPointerDown);
    this.canvas.removeEventListener("pointermove", this.boundPointerMove);
    this.canvas.removeEventListener("pointerup", this.boundPointerUp);
    this.canvas.removeEventListener("pointercancel", this.boundPointerUp);
    this.keys.clear();
    this.mouseButtons.clear();
    this.dragStartCallbacks = [];
    this.dragCallbacks = [];
    this.dragEndCallbacks = [];
    this.firstClickCallbacks = [];
  }
}
