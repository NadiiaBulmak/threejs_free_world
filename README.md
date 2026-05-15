# Three.js Game Template - TypeScript

Lightweight, modular, and extensible template for building 3D web games using Three.js and TypeScript. Built with controller-based architecture for clean, scalable code.

## 🎯 Features

- **Controller-based Architecture** - Separation of concerns with reusable controllers
- **Type-safe** - Full TypeScript support with proper interfaces
- **Modular** - Easy to extend and customize
- **Lightweight** - Minimal dependencies, optimized for small file sizes
- **Event System** - Global event bus for component communication
- **Resource Management** - Centralized asset loading and cleanup
- **Input Handling** - Keyboard, mouse, and touch input support
- **Debug Tools** - Built-in visualization helpers and logging

## 📦 Installation

```bash
# Clone or setup the project
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🏗️ Architecture

### Core Controllers

All controllers inherit from base classes:

- **BaseC** - Base controller with init/update/destroy lifecycle
- **UpdateBaseC** - For controllers that update each frame
- **DisposableC** - Auto resource cleanup

### Main Controllers

1. **InitC** - Main initialization & lifecycle manager
2. **SceneC** - Scene management with object registry
3. **CameraC** - Camera with follow/shake effects
4. **RendererC** - WebGL renderer setup
5. **GameLoopC** - Main update loop
6. **TimeC** - FPS tracking & delta time
7. **InputC** - Keyboard/Mouse/Touch input
8. **ResizeC** - Window resize handling
9. **EventBusC** - Global event system
10. **LightC** - Light management
11. **ResourceC** - Asset management
12. **PhysicsC** - Physics abstraction (ready for integration)
13. **DebugC** - Debug visualization helpers

## 🚀 Quick Start

```typescript
import { InitC } from "./core/init/InitC";

async function main() {
  const game = new InitC();
  await game.init();

  // Add your game logic here

  game.start();
}

main();
```

## 📂 Project Structure

```
src/
├── core/
│   ├── base/          # Base classes
│   ├── scene/         # Scene, Camera, Renderer
│   ├── loop/          # Game loop & time
│   ├── input/         # Input handling
│   ├── events/        # Event system
│   ├── resources/     # Asset management
│   ├── physics/       # Physics abstraction
│   ├── resize/        # Window resize
│   ├── debug/         # Debug tools
│   └── init/          # Main initialization
├── config/            # Configuration files
├── types/             # TypeScript interfaces
├── game/              # Game logic (entities, levels, etc.)
└── main.ts            # Entry point
```

## 🎮 Usage Examples

### Adding Objects to Scene

```typescript
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(geometry, material);

game.scene.add(mesh, "my-cube"); // Add with name
game.scene.findByName("my-cube"); // Retrieve
```

### Lighting

```typescript
// Ambient light
game.light.addAmbientLight(0xffffff, 0.6);

// Directional light
game.light.addDirectionalLight(0xffffff, 0.8, new THREE.Vector3(5, 10, 5));

// Point light
game.light.addPointLight(0xff0000, 1, 100, new THREE.Vector3(0, 5, 0));
```

### Input Handling

```typescript
// Keyboard
if (game.input.isKeyPressed("KeyW")) {
  // Move forward
}

// Mouse
if (game.input.isMouseDown(0)) {
  // Left click
}

const mousePos = game.input.getMousePosition();
```

### Events

```typescript
// Emit event
game.events.emit("PLAYER_DIED", { score: 100 });

// Listen to event
game.events.on("PLAYER_DIED", (data) => {
  console.log("Player died with score:", data.score);
});
```

### Debug Tools

```typescript
// Show grid and axes
game.debug.showGridHelper(20, 20);
game.debug.showAxesHelper(5);

// Show bounding box
game.debug.showBoundingBoxHelper(mesh);

// Log info
game.debug.logCameraInfo();
game.debug.logSceneInfo();
game.debug.logFPS();
```

## 🔧 Configuration

Path aliases for clean imports:

```typescript
import { InitC } from "@core/init/InitC";
import type { ICore } from "@types/core";
```

Available aliases:

- `@core/*` - Core controllers
- `@config/*` - Configuration files
- `@game/*` - Game logic
- `@types/*` - TypeScript types

## 📋 Development Roadmap

### Etap 1 ✅ (Complete)

- Base controllers & architecture
- Scene, Camera, Renderer
- Game loop & time
- Input system
- Events & callbacks
- Lights & Debug

### Etap 2 (Planned)

- Resource loaders (Texture, Model, Audio)
- Animation controller
- Particle effects

### Etap 3 (Planned)

- Movement & Rotation controllers
- Physics integration (Cannon.js/Rapier)
- Collision detection

### Etap 4 (Planned)

- Entity system
- Player controller
- Enemy spawner

### Etap 5+ (Advanced)

- ECS architecture
- Multiplayer support
- Save/Load system
- UI framework
- Postprocessing effects

## 📝 License

MIT - Feel free to use this template for your projects!

## 🤝 Contributing

This is a template for your personal use. Feel free to customize it for your needs!

## 💡 Tips

- Keep controllers focused on a single responsibility
- Use the event system for communication between systems
- Leverage TypeScript for type safety
- The debug tools are great for development - disable in production
- Organize game logic in the `src/game/` directory

---

**Happy coding! 🎮**
