import createEntity from "./entities.js";
import { pntBtw2Pnts } from "./map.js";
import { easeInOutCubic, drawPolygon, drawFile } from "./rendering.js";

function isInLocation(position, location) {
  return Math.floor(position.x - location.x) === 0 && Math.floor(position.y - location.y) === 0;
}

function incStep(step, direction) {
  const incr = direction === 0 ? 1 : -1;
  return step + incr;
}

function movingEntitity(start, steps, speed, loop = true) {
  return {
    start: { ...start },
    steps: [start, ...steps],
    step: 0,
    position: { ...start },
    speed,
    easingSpeed: 150,
    easingFunc: easeInOutCubic,
    lastVisited: 0,
    easingTicks: 0,
    direction: 0,
    loop,
    run: (gameState, element) => {
      const { steps, step, direction, position, loop, easingSpeed, easingMaxMult, easingFunc } = element;
      const newStp = incStep(step, direction);
      let nextStep = element.steps[newStp] || null;
      // FIX for last step
      element.easingTicks++;
      if (nextStep) {
        // se in step
        if (isInLocation(position, nextStep)) {
          element.lastVisited = newStp;
          element.easingTicks = 0;
          // se primo o ultimo step
          if ((step === steps.length - 1 && direction === 0) || (step === 0 && direction === 1)) {
            // cambia direzione
            element.direction = direction === 0 ? 1 : 0;
            // altrimenti
          }
          // aggiorna lo step
          element.step = incStep(step, direction);
        }

        const nextPos = pntBtw2Pnts(element.position, element.steps[newStp], element.speed * easingFunc(element.easingTicks / easingSpeed));
        element.position = nextPos || position;
      } else if (loop) {
        element.step = -1;
      } else {
        element.direction = direction === 0 ? 1 : 0;
      }

      return element;
    },
  };
}

export function createEnemyEntity(position) {
  const speed = 4;
  const entity = createEntity({
    ...movingEntitity(
      position,
      [
        { x: position.x + 100, y: position.y },
        { x: position.x + 100, y: position.y + 100 },
      ],
      speed
    ),
    type: "enemy",
    r: 10,
    render: (gameState, element, relPos) => {
      const { ctx, map, canvas } = gameState.getByKeys(["ctx", "map", "canvas"]);

      ctx.beginPath();
      ctx.fillStyle = "tomato";

      ctx.arc(relPos.x, relPos.y, element.r, 0, 2 * Math.PI);
      ctx.fill();
    },
  });

  return entity;
}

export function create403Entity(position, speed = 4, steps = []) {
  return createEntity({
    ...movingEntitity(position, steps, speed),
    type: "403",
    r: 10,
    render: (gameState, element, relPos) => {
      const { ctx, map, canvas } = gameState.getByKeys(["ctx", "map", "canvas"]);

      ctx.beginPath();
      ctx.fillStyle = "tomato";

      ctx.arc(relPos.x, relPos.y, element.r, 0, 2 * Math.PI);
      ctx.fill();
    },
  });
}
export function create404Entity(position) {
  const entity = createEntity({
    position,
    fileType: (() => {
      const types = ["js", "html", "css"];
      return types[Math.round(Math.random() * (types.length - 1))];
    })(),
    type: "404",
    r: 10,
    render: (gameState, element, relPos) => {
      const { ctx, map, canvas } = gameState.getByKeys(["ctx", "map", "canvas"]);

      const w = element.r - 2;
      const h = element.r;
      const fold = 5;

      ctx.beginPath();
      drawFile(ctx, { x: relPos.x - w, y: relPos.y - h }, w, h, fold);
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();

      ctx.rect(relPos.x - w - 5, relPos.y + h / 2 - 11, 25, 13);
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fill();
      ctx.font = "12px serif";
      ctx.fillStyle = "white";
      ctx.fillText("404", relPos.x - w - 2, relPos.y + h / 2);
    },
  });

  return entity;
}

export function createExitEntity(position) {
  const entity = createEntity({
    position,
    type: "exit",
    opened: false,
    r: 10,
    render: (gameState, element, relPos) => {
      const { ctx, map, canvas } = gameState.getByKeys(["ctx", "map", "canvas"]);

      ctx.beginPath();
      ctx.fillStyle = element.opened ? "green" : "red";

      ctx.arc(relPos.x, relPos.y, element.r, 0, 2 * Math.PI);
      ctx.fill();
    },
    onCollide: (gameState, entity, oth) => {
      if (oth.player && entity.opened) {
        const { newLevel } = gameState.getByKeys(["newLevel"]);

        newLevel(gameState);
      }
    },
    run: (gameState, entity) => {
      const f0f = gameState.getState("entities", []).some((e) => e.type === "404");

      if (!f0f) entity.opened = true;
      return entity;
    },
  });

  return entity;
}
