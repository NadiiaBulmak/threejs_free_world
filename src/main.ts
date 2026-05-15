import { InitC } from "./core/init/InitC";

async function main(): Promise<void> {
  try {
    const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element "#game-canvas" not found');
    }

    const app = new InitC(canvas);
    await app.init();
    app.start();
  } catch (error) {
    console.error("Failed to start engine:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
