import createEntity from "./entities.js";
import { pntBtw2Pnts } from "./map.js";
import { easeInOutCubic, drawFile } from "./rendering.js";
import { findPoint2Angle } from "./utils.js";

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

function createEnemyEntity(baseData) {
  const { position, speed = 4, steps = [] } = baseData;
  return createEntity({
    ...movingEntitity(position, steps, speed),
    r: 10,
    enemy: true,
    collide: true,
  });
}

function circleWithSlashes(ctx, center, r, slashes = []) {
  ctx.arc(center.x, center.y, r, 0, 2 * Math.PI);
  slashes.forEach((s) => {
    const start = findPoint2Angle(s[0], center, r);
    ctx.moveTo(start.x, start.y);
    const end = findPoint2Angle(s[1], center, r);
    ctx.lineTo(end.x, end.y);
  });
}
export function create403Entity(baseData) {
  return {
    ...createEnemyEntity(baseData),
    type: "403",
    render: (gameState, element, relPos) => {
      const { ctx } = gameState.getByKeys(["ctx", "map", "canvas"]);
      const r = element.r;

      ctx.beginPath();

      circleWithSlashes(ctx, relPos, r, [
        [225, 45],
        [315, 135],
      ]);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.beginPath();

      ctx.rect(relPos.x - r - 2, relPos.y + r / 2, 25, 13);
      ctx.fillStyle = "rgba(255,0,0,0.8)";
      ctx.fill();
      ctx.beginPath();

      ctx.font = "12px serif";
      ctx.fillStyle = "white";
      ctx.fillText(element.type, relPos.x - r + 1, relPos.y + r + 6);
    },
  };
}

export function create401Entity(baseData) {
  const baseEntity = createEnemyEntity(baseData);
  return {
    ...baseEntity,
    disabled: false,
    run: (gameState, element) => {
      const { player } = gameState.getByKeys(["player"]);
      const { auth = false } = player.equip || {};
      if (auth) {
        element.disabled = true;
        element.collide = false;
      } else {
        element.disabled = false;
        element.collide = true;
      }

      return baseEntity.run(gameState, element);
    },
    type: "401",
    render: (gameState, element, relPos) => {
      const { ctx } = gameState.getByKeys(["ctx", "player"]);

      const r = element.r;

      ctx.beginPath();

      circleWithSlashes(ctx, relPos, r, [[225, 45]]);
      if (!element.disabled) {
        ctx.strokeStyle = "red";
      } else {
        ctx.strokeStyle = "rgba(100,100,200,0.6)";
      }
      ctx.lineWidth = 3.5;

      ctx.stroke();
      ctx.beginPath();

      ctx.rect(relPos.x - r - 2, relPos.y + r / 2, 25, 13);
      ctx.fillStyle = "rgba(255,0,0,0.8)";
      ctx.fill();
      ctx.beginPath();

      ctx.font = "12px serif";
      ctx.fillStyle = "white";
      ctx.fillText(element.type, relPos.x - r + 1, relPos.y + r + 6);
    },
  };
}
export function create404Entity(baseData) {
  const { position } = baseData;
  const entity = createEntity({
    position,
    fileType: (() => {
      const types = ["js", "html", "css"];
      return types[Math.round(Math.random() * (types.length - 1))];
    })(),
    type: "404",
    r: 10,
    collide: true,
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

export function createExitEntity(baseData) {
  return createEntity({
    ...baseData,
    type: "exit",
    opened: false,
    collide: false,
    r: 10,
    render: (gameState, element, relPos) => {
      const { ctx } = gameState.getByKeys(["ctx", "map", "canvas"]);

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

      if (!f0f) {
        entity.opened = true;
        entity.collide = true;
      }
      return entity;
    },
  });
}

export function createAuthEntity(baseData) {
  return createEntity({
    ...baseData,
    type: "auth",
    collide: true,
    r: 4,
    onCollect: () => ({ auth: true }),
    render: (gameState, element, relPos) => {
      const { ctx } = gameState.getByKeys(["ctx", "map", "canvas"]);

      ctx.beginPath();
      ctx.fillStyle = "pink";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 0.5;

      ctx.arc(relPos.x, relPos.y, element.r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    },
    run: (gameState, entity) => {
      const f0f = gameState.getState("entities", []).some((e) => e.type === "404");

      if (!f0f) entity.opened = true;
      return entity;
    },
  });
}
