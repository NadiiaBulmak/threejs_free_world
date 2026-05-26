import type { ICore } from "@engine-types/core";
import { EditorC } from "./EditorC";
import { allResourceGroups } from "@config/resources";
import * as THREE from "three";

const PANEL_ID = "__game_editor_panel";

export class EditorUI {
  private root: HTMLDivElement;
  private core: ICore;
  private editor: EditorC;

  constructor(core: ICore, editor: EditorC) {
    this.core = core;
    this.editor = editor;
    this.root = this._createPanel();
    document.body.appendChild(this.root);
  }

  private _createPanel(): HTMLDivElement {
    const root = document.createElement("div");
    root.id = PANEL_ID;
    root.style.position = "fixed";
    root.style.right = "12px";
    root.style.top = "12px";
    root.style.width = "320px";
    root.style.maxHeight = "70vh";
    root.style.overflow = "auto";
    root.style.background = "rgba(20,20,30,0.85)";
    root.style.color = "#fff";
    root.style.padding = "8px";
    root.style.zIndex = "9999";
    root.style.fontFamily = "system-ui, sans-serif";
    root.style.fontSize = "13px";

    const title = document.createElement("div");
    title.textContent = "Editor UI";
    title.style.fontWeight = "700";
    title.style.marginBottom = "8px";
    root.appendChild(title);

    const selectedLabel = document.createElement("div");
    selectedLabel.textContent = "Selected: none";
    selectedLabel.style.marginBottom = "8px";
    root.appendChild(selectedLabel);

    const updateSelectedLabel = (name: string | null) => {
      selectedLabel.textContent = `Selected: ${name ?? "none"}`;
    };

    // Prefab select
    const prefabLabel = document.createElement("div");
    prefabLabel.textContent = "Add prefab:";
    root.appendChild(prefabLabel);

    const prefabSelect = document.createElement("select");
    prefabSelect.style.width = "100%";
    prefabSelect.style.marginBottom = "6px";

    const meshItems = allResourceGroups
      .filter((group) => group.loader === "mesh")
      .flatMap((group) => group.items);

    if (meshItems.length === 0) {
      const emptyOpt = document.createElement("option");
      emptyOpt.value = "";
      emptyOpt.textContent = "(no mesh resources loaded)";
      emptyOpt.disabled = true;
      prefabSelect.appendChild(emptyOpt);
    } else {
      for (const item of meshItems) {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = item.id;
        prefabSelect.appendChild(opt);
      }
    }

    root.appendChild(prefabSelect);

    const addBtn = document.createElement("button");
    addBtn.textContent = "Add";
    addBtn.style.width = "100%";
    addBtn.onclick = () => {
      const id = prefabSelect.value;
      // place near origin
      const obj = this.editor.addObjectFromPrefab(id, { x: 0, y: 0.5, z: 0 });
      updateSelectedLabel(obj?.name ?? null);
    };
    root.appendChild(addBtn);

    // Export
    const exportBtn = document.createElement("button");
    exportBtn.textContent = "Export level JSON";
    exportBtn.style.width = "100%";
    exportBtn.style.marginTop = "8px";
    exportBtn.onclick = async () => {
      const txt = this.editor.exportLevelJson();
      await navigator.clipboard.writeText(txt);
      exportBtn.textContent = "Copied to clipboard";
      setTimeout(() => (exportBtn.textContent = "Export level JSON"), 1500);
    };
    root.appendChild(exportBtn);

    // Import textarea
    const importLabel = document.createElement("div");
    importLabel.textContent = "Import JSON:";
    importLabel.style.marginTop = "8px";
    root.appendChild(importLabel);

    const ta = document.createElement("textarea");
    ta.style.width = "100%";
    ta.style.height = "120px";
    ta.placeholder = '{ "levelId":"level_01","objects":[...] }';
    root.appendChild(ta);

    const importBtn = document.createElement("button");
    importBtn.textContent = "Import";
    importBtn.style.width = "100%";
    importBtn.onclick = () => {
      try {
        const data = JSON.parse(ta.value);
        this.editor.importLevelDesign(data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Invalid JSON", e);
        importBtn.textContent = "Invalid JSON";
        setTimeout(() => (importBtn.textContent = "Import"), 1200);
      }
    };
    root.appendChild(importBtn);

    // Reindex
    const reindexBtn = document.createElement("button");
    reindexBtn.textContent = "Reindex Objects";
    reindexBtn.style.width = "100%";
    reindexBtn.style.marginTop = "8px";
    reindexBtn.onclick = () => this.editor.reindexObjects();
    root.appendChild(reindexBtn);

    // Transform mode buttons
    const modeWrap = document.createElement("div");
    modeWrap.style.display = "flex";
    modeWrap.style.gap = "6px";
    modeWrap.style.marginTop = "8px";
    const translateBtn = document.createElement("button");
    translateBtn.textContent = "Move";
    translateBtn.onclick = () => this.editor.setTransformMode("translate");
    const rotateBtn = document.createElement("button");
    rotateBtn.textContent = "Rotate";
    rotateBtn.onclick = () => this.editor.setTransformMode("rotate");
    const scaleBtn = document.createElement("button");
    scaleBtn.textContent = "Scale";
    scaleBtn.onclick = () => this.editor.setTransformMode("scale");
    modeWrap.appendChild(translateBtn);
    modeWrap.appendChild(rotateBtn);
    modeWrap.appendChild(scaleBtn);
    root.appendChild(modeWrap);

    const adjustLabel = document.createElement("div");
    adjustLabel.textContent = "Adjust selected:";
    adjustLabel.style.marginTop = "8px";
    root.appendChild(adjustLabel);

    const adjustWrap = document.createElement("div");
    adjustWrap.style.display = "grid";
    adjustWrap.style.gridTemplateColumns = "repeat(2, 1fr)";
    adjustWrap.style.gap = "6px";

    const scaleUpBtn = document.createElement("button");
    scaleUpBtn.textContent = "+ Scale";
    scaleUpBtn.onclick = () => this.editor.scaleSelected(1.1);
    const scaleDownBtn = document.createElement("button");
    scaleDownBtn.textContent = "- Scale";
    scaleDownBtn.onclick = () => this.editor.scaleSelected(0.9);
    const rotateLeftBtn = document.createElement("button");
    rotateLeftBtn.textContent = "⟲ Rotate";
    rotateLeftBtn.onclick = () => this.editor.rotateSelected(0, 0.1, 0);
    const rotateRightBtn = document.createElement("button");
    rotateRightBtn.textContent = "⟳ Rotate";
    rotateRightBtn.onclick = () => this.editor.rotateSelected(0, -0.1, 0);

    adjustWrap.appendChild(scaleUpBtn);
    adjustWrap.appendChild(scaleDownBtn);
    adjustWrap.appendChild(rotateLeftBtn);
    adjustWrap.appendChild(rotateRightBtn);
    root.appendChild(adjustWrap);

    const moveLabel = document.createElement("div");
    moveLabel.textContent = "Nudge position:";
    moveLabel.style.marginTop = "8px";
    root.appendChild(moveLabel);

    const moveWrap = document.createElement("div");
    moveWrap.style.display = "grid";
    moveWrap.style.gridTemplateColumns = "repeat(3, 1fr)";
    moveWrap.style.gap = "6px";
    const moveXPos = document.createElement("button");
    moveXPos.textContent = "+X";
    moveXPos.onclick = () => this.editor.moveSelected(0.1, 0, 0);
    const moveYPos = document.createElement("button");
    moveYPos.textContent = "+Y";
    moveYPos.onclick = () => this.editor.moveSelected(0, 0.1, 0);
    const moveZPos = document.createElement("button");
    moveZPos.textContent = "+Z";
    moveZPos.onclick = () => this.editor.moveSelected(0, 0, 0.1);
    const moveXNeg = document.createElement("button");
    moveXNeg.textContent = "-X";
    moveXNeg.onclick = () => this.editor.moveSelected(-0.1, 0, 0);
    const moveYNeg = document.createElement("button");
    moveYNeg.textContent = "-Y";
    moveYNeg.onclick = () => this.editor.moveSelected(0, -0.1, 0);
    const moveZNeg = document.createElement("button");
    moveZNeg.textContent = "-Z";
    moveZNeg.onclick = () => this.editor.moveSelected(0, 0, -0.1);

    moveWrap.appendChild(moveXPos);
    moveWrap.appendChild(moveYPos);
    moveWrap.appendChild(moveZPos);
    moveWrap.appendChild(moveXNeg);
    moveWrap.appendChild(moveYNeg);
    moveWrap.appendChild(moveZNeg);
    root.appendChild(moveWrap);

    // Scene children list (draggable)
    const sceneLabel = document.createElement("div");
    sceneLabel.textContent = "Scene objects:";
    sceneLabel.style.marginTop = "8px";
    root.appendChild(sceneLabel);

    const sceneList = document.createElement("div");
    sceneList.style.display = "flex";
    sceneList.style.flexDirection = "column";
    sceneList.style.gap = "4px";
    sceneList.style.marginBottom = "6px";
    root.appendChild(sceneList);

    const populateSceneList = () => {
      sceneList.innerHTML = "";
      try {
        const sceneRes = (this.core.resources.get("scene") as any) || null;
        if (sceneRes) {
          const children = sceneRes.children ?? [];
          for (const child of children) {
            if ((child.name || "").toLowerCase().includes("armature")) {
              continue;
            }
            const entry = document.createElement("div");
            entry.textContent = child.name || child.type || "child";
            entry.style.padding = "4px";
            entry.style.background = "rgba(255,255,255,0.04)";
            entry.draggable = true;
            entry.addEventListener("dragstart", (ev) => {
              ev.dataTransfer?.setData("text/prefab", "scene");
              ev.dataTransfer?.setData("text/child", child.name || "");
            });
            entry.onclick = () => {
              // add at camera target
              const cam = this.core.camera.getCamera();
              const target = new THREE.Vector3();
              cam.getWorldDirection(target);
              const pos = cam.position.clone().add(target.multiplyScalar(3));
              // request EditorC to add specific child from scene resource
              const inst = this.editor.addObjectFromPrefab(
                child.name || "scene",
                { x: pos.x, y: pos.y, z: pos.z },
              );
              if (inst) {
                updateSelectedLabel(inst.name);
              } else {
                const maybe = this.editor.addObjectFromPrefabAtScreen(
                  "scene",
                  window.innerWidth / 2,
                  window.innerHeight / 2,
                );
                updateSelectedLabel(maybe?.name ?? null);
              }
            };
            sceneList.appendChild(entry);
          }
        } else {
          const empty = document.createElement("div");
          empty.textContent = "(no scene resource loaded)";
          empty.style.opacity = "0.7";
          sceneList.appendChild(empty);
        }
      } catch (e) {
        // ignore
      }
    };
    populateSceneList();

    // Enable drag-and-drop onto canvas
    try {
      const canvas = this.core.renderer.getCanvas();
      canvas.addEventListener("dragover", (ev) => ev.preventDefault());
      canvas.addEventListener("drop", (ev) => {
        ev.preventDefault();
        const prefab = ev.dataTransfer?.getData("text/prefab");
        const child = ev.dataTransfer?.getData("text/child");
        let inst: THREE.Object3D | null = null;
        if (prefab === "scene" && child) {
          inst = this.editor.addObjectFromPrefabAtScreen(
            child,
            ev.clientX,
            ev.clientY,
          );
        } else if (prefab) {
          inst = this.editor.addObjectFromPrefabAtScreen(
            prefab,
            ev.clientX,
            ev.clientY,
          );
        }
        updateSelectedLabel(inst?.name ?? null);
      });
    } catch (e) {
      // ignore if not available
    }

    // Click on canvas to select objects
    try {
      const canvas = this.core.renderer.getCanvas();
      canvas.addEventListener("pointerdown", (ev) => {
        if (ev.button === 0) {
          const obj = this.editor.selectByScreen(ev.clientX, ev.clientY);
          updateSelectedLabel(obj?.name ?? null);
        }
      });
    } catch (e) {
      // ignore
    }

    return root;
  }
}

export default EditorUI;
