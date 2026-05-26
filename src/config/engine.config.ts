/**
 * Engine configuration for the Three.js base template.
 */

export const engineConfig = {
  /** Demo-сцена в afterResourceLoaded (template/callbacks/lifecycle) */
  sampleScene: {
    enabled: true,
    /** 'builtin' = internal demo scene, 'file' = load scene from resources as-is */
    mode: "file" as const,
  },

  editor: {
    enabled: true,
    devOnly: true,
    panelOpacity: 0.85,
    gizmoEnabled: true,
  },

  editor: {
    enabled: true,
    devOnly: true,
    panelOpacity: 0.85,
    gizmoEnabled: true,
  },

  orbit: {
    enabled: true,
    target: { x: 0, y: 0.5, z: 0 },
    enableDamping: true,
    dampingFactor: 0.05,
    enableZoom: true,
    enablePan: true,
    enableRotate: true,
    minDistance: 2,
    maxDistance: 50,
    maxPolarAngle: Math.PI * 0.49,
  },

  renderer: {
    pixelRatio: "auto" as const,
    antialias: true,
    powerPreference: "high-performance" as const,
    clearColor: 0x000000,
  },

  physics: {
    enabled: false,
    gravity: { x: 0, y: -9.81, z: 0 },
  },

  screen: {
    backgroundColor: 0x000000,
  },
};

export default engineConfig;
