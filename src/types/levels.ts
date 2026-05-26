export interface LevelObjectPlacement {
  index: number;
  prefabId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  name?: string;
  tag?: string;
  visible?: boolean;
  userData?: Record<string, unknown>;
}

export interface LevelEntry {
  id: string;
  name: string;
  enabled: boolean;
  worldId: string;
  objects: LevelObjectPlacement[];
  spawn?: { x: number; y: number; z: number };
  meta?: Record<string, unknown>;
}

export interface LevelsConfig {
  defaultLevelId: string;
  levels: LevelEntry[];
}

export function sortObjectsByIndex(objects: LevelObjectPlacement[]) {
  return objects.slice().sort((a, b) => a.index - b.index);
}

export function getObjectByIndex(level: LevelEntry, index: number) {
  return level.objects.find((o) => o.index === index);
}
