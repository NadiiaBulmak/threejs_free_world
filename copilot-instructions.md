# План для Copilot — Архітектура Template для Web 3D Game на Three.js

## 🎯 Ціль

Створити масштабований template/framework для невеликих 3D web-ігор на базі:

* JS (ES6 Classes)
* Three.js
* Controller-based architecture
* Event/callback system
* Resource management
* Physics support
* Extendable base classes

---

# 1. Базова структура проекту

```txt
src/
│
├── core/
│   ├── init/
│   │   └── InitC.js
│   │
│   ├── scene/
│   │   ├── SceneC.js
│   │   ├── CameraC.js
│   │   ├── RendererC.js
│   │   └── LightC.js
│   │
│   ├── loop/
│   │   ├── GameLoopC.js
│   │   └── TimeC.js
│   │
│   ├── input/
│   │   ├── InputC.js
│   │   ├── KeyboardC.js
│   │   ├── MouseC.js
│   │   └── TouchC.js
│   │
│   ├── movement/
│   │   ├── MoveC.js
│   │   └── RotateC.js
│   │
│   ├── physics/
│   │   ├── PhysicsC.js
│   │   ├── RigidBodyC.js
│   │   └── ColliderC.js
│   │
│   ├── resources/
│   │   ├── ResourceC.js
│   │   ├── TextureLoaderC.js
│   │   ├── ModelLoaderC.js
│   │   ├── AudioLoaderC.js
│   │   └── VFXLoaderC.js
│   │
│   ├── resize/
│   │   └── ResizeC.js
│   │
│   ├── events/
│   │   └── EventBusC.js
│   │
│   ├── base/
│   │   ├── BaseC.js
│   │   ├── UpdateBaseC.js
│   │   └── DisposableC.js
│   │
│   └── debug/
│       └── DebugC.js
│
├── config/
│   ├── textures.config.js
│   ├── models.config.js
│   ├── audio.config.js
│   ├── vfx.config.js
│   └── game.config.js
│
├── game/
│   ├── player/
│   ├── enemies/
│   ├── ui/
│   └── levels/
│
└── main.js
```

---

# 2. Base Controller Architecture

## 🎯 Задача

Copilot має створити базову систему контроллерів, від яких наслідуються всі інші.

---

## BaseC.js

Базовий клас:

```js
class BaseC {
  constructor(core) {
    this.core = core;
  }

  init() {}

  update(delta) {}

  destroy() {}
}
```

---

## UpdateBaseC.js

Для всіх контроллерів, які оновлюються в loop.

```js
class UpdateBaseC extends BaseC {
  update(delta) {}
}
```

---

## DisposableC.js

Автоматичне очищення:

```js
class DisposableC extends BaseC {
  destroy() {
    // remove listeners
    // dispose geometry
    // dispose materials
  }
}
```

---

# 3. Init Controller (InitC)

## 🎯 Головний контроллер

Copilot має створити клас InitC, який:

* створює renderer
* сцену
* камеру
* physics
* loaders
* loop
* input
* resize system
* запускає update loop

---

## Init Flow

```txt
InitC
 ├── create renderer
 ├── create scene
 ├── create camera
 ├── init physics
 ├── init input
 ├── load resources
 ├── beforeResourceLoaded callbacks
 ├── afterResourceLoaded callbacks
 ├── start game loop
```

---

## Основні методи

```js
init()
createCore()
loadResources()
start()
destroy()
```

---

# 4. Resource System

## 🎯 Система підгрузки ресурсів

Copilot має зробити централізований Resource Manager.

---

# Конфіги

## textures.config.js

```js
export default [
  {
    id: 'grass',
    path: '/textures/grass.jpg'
  }
];
```

---

## models.config.js

```js
export default [
  {
    id: 'player',
    path: '/models/player.glb'
  }
];
```

---

## audio.config.js

```js
export default [
  {
    id: 'bgMusic',
    path: '/audio/bg.mp3'
  }
];
```

---

# ResourceC.js

## Має:

* preload()
* get()
* has()
* dispose()

---

# Loader Controllers

Copilot має зробити:

* TextureLoaderC
* ModelLoaderC
* AudioLoaderC
* VFXLoaderC

---

# 5. Scene Controller

## 🎯 SceneC

Контроллер для роботи зі сценою.

---

## Повинен вміти:

```js
add(object)
remove(object)
findByName(name)
clear()
```

---

## Додатково

Copilot має зробити:

* automatic dispose
* object registry
* scene groups/layers

---

# 6. Movement Controllers

# MoveC

```js
moveForward(speed)
moveBackward(speed)
moveLeft(speed)
moveRight(speed)
```

---

# RotateC

```js
rotateX(speed)
rotateY(speed)
lookAt(target)
```

---

# Важливо

Контроллери не мають містити game logic.

Лише базову функціональність.

---

# 7. Physics System

## 🎯 PhysicsC

Copilot має створити abstraction layer.

---

## Основні методи

```js
createRigidBody(mesh)
createCollider(mesh)
removeBody(body)
update(delta)
```

---

# Рекомендується

Підготувати систему під:

* cannon-es
* rapier
* ammo.js

---

# 8. Input System

## 🎯 InputC

Єдина система вводу.

---

## Підтримка

* keyboard
* mouse
* touch
* gamepad (optional)

---

## API

```js
isKeyPressed('KeyW')
isMouseDown(0)
getMousePosition()
```

---

# 9. Resize System

## 🎯 ResizeC

Автоматичний resize canvas.

---

## Callback System

```js
onResize(callback)
removeResizeCallback(callback)
```

---

## Resize Logic

```txt
window resize
 ├── update camera aspect
 ├── update projection matrix
 ├── update renderer size
 └── execute callbacks
```

---

# 10. Event Bus

## 🎯 EventBusC

Глобальна event system.

---

## API

```js
on(event, callback)
off(event, callback)
emit(event, data)
```

---

# Використання

```js
eventBus.emit('PLAYER_DIED')
```

---

# 11. Game Loop

## 🎯 GameLoopC

---

## Повинен:

* запускати update cycle
* викликати всі update()
* мати pause/resume
* мати fixed update

---

## API

```js
start()
stop()
pause()
resume()
```

---

# 12. Callback System

## 🎯 Before/After Resource Loaded

---

## BeforeResourceLoaded

```js
beforeLoad(() => {})
```

---

## AfterResourceLoaded

```js
afterLoad(() => {})
```

---

# 13. Entity Architecture

## 🎯 Entity system

Copilot має зробити:

```js
class Player extends Entity
```

---

# Entity має:

```js
init()
update()
destroy()
```

---

# Entity Components

* mesh
* physics
* movement
* health
* animation

---

# 14. Renderer Controller

## 🎯 RendererC

---

## Повинен:

```js
setPixelRatio()
setSize()
enableShadows()
setToneMapping()
```

---

# 15. Camera Controller

## 🎯 CameraC

---

## Повинен:

```js
followTarget()
shake()
resize()
```

---

# 16. Debug System

## 🎯 DebugC

---

## Features

* FPS monitor
* physics debug
* axes helper
* grid helper

---

# 17. Архітектурні правила

## ❗ Важливо

Copilot має дотримуватись:

---

## SOLID-like architecture

* одна відповідальність
* слабка зв’язаність
* розширення через наслідування

---

## Controllers НЕ повинні:

❌ містити game logic
❌ залежати один від одного напряму
❌ мутувати глобальний state

---

## Controllers повинні:

✅ працювати через core
✅ бути незалежними
✅ легко замінюватись
✅ легко тестуватись

---

# 18. Core Object

## 🎯 Єдиний контейнер

```js
core = {
  scene,
  camera,
  renderer,
  physics,
  input,
  resources,
  events
}
```

---

# 19. Main Entry

## main.js

```js
const game = new InitC();

game.init();
```

---

# 20. Що має зробити Copilot поетапно

# Етап 1

Створити:

* BaseC
* UpdateBaseC
* InitC
* SceneC
* RendererC
* CameraC

---

# Етап 2

Створити:

* GameLoopC
* ResizeC
* EventBusC

---

# Етап 3

Створити:

* ResourceC
* всі loaders
* config system

---

# Етап 4

Створити:

* InputC
* KeyboardC
* MouseC

---

# Етап 5

Створити:

* MoveC
* RotateC
* PhysicsC

---

# Етап 6

Створити:

* Entity system
* Player entity
* Debug tools

---

# 21. Фінальна ціль

Отримати reusable mini-engine/template для:

* FPS
* Third Person
* Simulator
* Arcade
* Puzzle games
* Experimental Three.js projects

---

# 22. Додатково (Advanced)

Copilot може потім додати:

* ECS architecture
* Multiplayer layer
* Save system
* UI framework
* Animation controller
* Sound manager
* State machine
* Scene transitions
* Postprocessing
* Mobile optimization
* Asset streaming
