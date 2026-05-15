export interface CameraOrientationConfig {
  fov: number;
  near: number;
  far: number;
  position: { x: number; y: number; z: number };
  lookAt: { x: number; y: number; z: number };
}

export const cameraConfig = {
  portrait: {
    fov: 70,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 6, z: 12 },
    lookAt: { x: 0, y: 5, z: 5 },
  },
  landscape: {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 5, z: 10 },
    lookAt: { x: 0, y: 5, z: 5 },
  },
} satisfies Record<"portrait" | "landscape", CameraOrientationConfig>;

export default cameraConfig;
