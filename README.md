# Three.js Engine Template

Мінімальний TypeScript-шаблон для 3D-ігор на Three.js з controller-based архітектурою: базовий шар движка, завантаження ресурсів, template callbacks і організований game loop.

Детальна специфікація: [`docs/ENGINE_ARCHITECTURE.md`](docs/ENGINE_ARCHITECTURE.md)

## Можливості

- **InitC** — ініціалізація всіх базових контроллерів і lifecycle
- **Template callbacks** — логіка гри без зміни `InitC` (`beforeResourceLoaded`, `afterResourceLoaded`, resize, firstClick)
- **Ресурси** — групи з одним лоадером (`LoaderC` → texture / image / audio / mesh / vfx)
- **Камера** — окремі налаштування portrait / landscape
- **Input** — клавіатура, миша, click-drag на canvas, `onFirstClick`
- **OrbitControls** — обертання / зум / панорама камери
- **Physics** — Cannon-es (опційно через `engine.config.ts`)
- **MoveC / RotateC** — база для персонажа
- **updateDelegate** — пріоритетне оновлення систем у game loop

## Встановлення

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build → dist/
npm run type-check
```

## Швидкий старт

```typescript
import { InitC } from "@core/init/InitC";

async function main() {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
  const app = new InitC(canvas);
  await app.init(); // lifecycle + завантаження ресурсів
  app.start();
}

main();
```

## Життєвий цикл

1. `InitC` створює інфраструктуру та базові контроллери
2. `beforeResourceLoaded` — підготовка до завантаження
3. `LoaderC.loadAll(allResourceGroups)` — ресурси в `ResourceC`
4. `afterResourceLoaded` — сцена, світло, геймплей
5. Реєстрація `updateDelegate`, resize / firstClick callbacks
6. `start()` — RAF loop (update → render)

## Структура проєкту

```text
src/
├── main.ts
├── types/              # ICore, ResourceGroup, ResourceItem
├── config/
│   ├── engine.config.ts
│   ├── camera.config.ts
│   └── resources/      # music, meshes, images, textures, vfx
├── core/
│   ├── base/           # BaseC, UpdateBaseC, DisposableC
│   ├── init/           # InitC
│   ├── loop/           # GameLoopC, TimeC
│   ├── scene/          # SceneC, CameraC, OrbitC, RendererC
│   ├── input/          # InputC (click-drag)
│   ├── character/      # MoveC, RotateC
│   ├── physics/        # PhysicsC
│   ├── resources/      # ResourceC, LoaderC, loaders/
│   ├── resize/         # ResizeC
│   ├── events/         # EventBusC
│   ├── debug/          # DebugC (опційно)
│   └── scene/LightC.ts # опційно, не в InitC
└── template/
    ├── GameTemplate.ts
    └── callbacks/      # lifecycle, resize, firstClick, update
docs/
└── ENGINE_ARCHITECTURE.md
```

## Базові контроллери (InitC)

| Контроллер | Призначення |
|------------|-------------|
| `SceneC` | Сцена та іменовані об'єкти |
| `CameraC` | Камера, portrait / landscape |
| `OrbitC` | OrbitControls (увімкнено в `engine.config`) |
| `PhysicsC` | Cannon-es, гравітація, rigid body |
| `InputC` | Клавіатура, миша, click-drag, firstClick |
| `MoveC` / `RotateC` | Рух і обертання цілі (майбутній персонаж) |
| `LoaderC` / `ResourceC` | Завантаження та сховище ресурсів |

## Ресурси

Кожен файл у `config/resources/` — група: спочатку `items`, один `loader` на всю групу.

```typescript
// src/config/resources/images.resources.ts
export const imageResources: ResourceGroup = {
  items: [
    { id: "ui-logo", url: "/images/logo.png" },
  ],
  loader: "image",
};
```

Після додавання ресурсів вони підвантажуються автоматично через `allResourceGroups` у `InitC.init()`.

Отримання зі сховища:

```typescript
const logo = app.resources.get("ui-logo");
```

## Template callbacks

Редагуй файли в `src/template/callbacks/`:

| Файл | Коли викликається |
|------|-------------------|
| `lifecycle.callbacks.ts` | До / після завантаження ресурсів |
| `resize.callbacks.ts` | Зміна розміру вікна |
| `firstClick.callbacks.ts` | Перший клік (unlock audio тощо) |
| `update.callbacks.ts` | Реєстрація `updateDelegate` |

Приклад — додати свій tick:

```typescript
// update.callbacks.ts
core.gameLoop.addUpdateDelegate((delta) => {
  myGameplayUpdate(delta);
}, 50);
```

## Приклади

### Об'єкт на сцені

```typescript
const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x4a9eff }),
);
app.scene.add(mesh, "cube");
```

### Input

```typescript
if (app.input.isKeyPressed("KeyW")) { /* ... */ }

app.input.onDrag((data) => {
  console.log(data.delta.x, data.delta.y);
});

app.input.onFirstClick(() => {
  console.log("First click");
});
```

### Події

```typescript
app.events.on("firstClick", () => { /* ... */ });
app.events.emit("CUSTOM_EVENT", { value: 1 });
```

## Конфігурація

**`engine.config.ts`** — renderer, physics, orbit, demo-сцена.

**`camera.config.ts`** — `portrait` / `landscape` (fov, position, lookAt).

## Path aliases

| Alias | Шлях |
|-------|------|
| `@core/*` | `src/core/*` |
| `@config/*` | `src/config/*` |
| `@engine-types/*` | `src/types/*` |
| `@template/*` | `src/template/*` |

```typescript
import { InitC } from "@core/init/InitC";
import type { ICore } from "@engine-types/core";
import { imageResources } from "@config/resources/images.resources";
```

## Розширення

1. Додай ресурси у відповідний `config/resources/*.ts`
2. Логіку після завантаження — у `afterResourceLoaded`
3. Resize / firstClick — у відповідних callback-файлах
4. Новий tick — `addUpdateDelegate` у `update.callbacks.ts`
5. **Не роздувай `InitC`** — кастомна логіка лише в `template/` або майбутньому `game/`

Опційні модулі (`LightC`, `DebugC`) підключай у `afterResourceLoaded`, не в базовому InitC.

## Залежності

- [three](https://threejs.org/) ^0.128
- [cannon-es](https://github.com/pmndrs/cannon-es) ^0.20

## Ліцензія

MIT
