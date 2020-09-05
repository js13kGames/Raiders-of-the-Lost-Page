import createEntity from "./entities.js";
import { dstBtw2Pnts, pntBtw2Pnts, findPath, tilePosition } from "./map.js";
import { easeInOutCubic, drawFile } from "./rendering.js";
import { render403, render401 } from "./game_rendering.js";

function isInLocation(position, location) {
  return (
    Math.floor(position.x - location.x) === 0 &&
    Math.floor(position.y - location.y) === 0
  );
}

function incStep(step, direction) {
  const incr = direction === 0 ? 1 : -1;
  return step + incr;
}

const runSteps = (gameState, element) => {
  const {
    steps,
    step,
    direction,
    position,
    loop,
    easingSpeed,
    easingMaxMult,
    easingFunc,
    blocked,
  } = element;

  const { map } = gameState.getByKeys(["map"]);
  const newStp = incStep(step, direction);
  let nextStep = element.steps[newStp] || null;
  element.easingTicks++;
  if (nextStep) {
    // se in step
    if (isInLocation(position, nextStep)) {
      element.lastVisited = newStp;
      element.easingTicks = 0;
      // se primo o ultimo step
      if (
        (step === steps.length - 1 && direction === 0) ||
        (step === 0 && direction === 1)
      ) {
        // cambia direzione
        element.direction = direction === 0 ? 1 : 0;
        // altrimenti
      }
      // aggiorna lo step
      element.step = incStep(step, direction);
    }

    const nextPos = pntBtw2Pnts(
      element.position,
      element.steps[newStp],
      element.speed * easingFunc(element.easingTicks / easingSpeed)
    );

    const t = {
      x: Math.floor(element.position.x / map.tsize),
      y: Math.floor(element.position.y / map.tsize),
    };
    const nt = {
      x: Math.floor(element.steps[newStp].x / map.tsize),
      y: Math.floor(element.steps[newStp].y / map.tsize),
    };

    const nextPx = pntBtw2Pnts(t, nt, 1);
    let canContinue = true;
    if (blocked.t && nextPx.y < t.y) {
      canContinue = false;
    }
    if (blocked.r && nextPx.x > t.x) {
      canContinue = false;
    }

    if (blocked.b && nextPx.y > t.y) {
      canContinue = false;
    }
    if (blocked.l && nextPx.x < t.x) {
      canContinue = false;
    }

    if (canContinue) {
      element.position = nextPos || position;
    } else {
      element.direction = direction === 0 ? 1 : 0;
      element.step++;
      if (element.step > steps.length) element.step -= 1;
      element.easingTicks = 0;
    }
  } else if (loop) {
    element.step -= 1;
  } else {
    element.direction = direction === 0 ? 1 : 0;
  }

  return element;
};

const goTo = (gameState, element) => {
  const { map, player } = gameState.getByKeys(["map", "player"]);

  const { position, updatePathEvery, updatePath, maxPath } = element;
  if (dstBtw2Pnts(player.position, position) > maxPath) return element;

  if (updatePath > updatePathEvery) {
    element.path = findPath(
      [
        Math.floor(element.position.x / map.tsize),
        Math.floor(element.position.y / map.tsize),
      ],
      [Math.floor(player.currentTile.c), Math.floor(player.currentTile.r)],
      map
    );
    element.updatePath = 0;
  } else {
    element.updatePath++;
  }

  const newStp = element.path && element.path[0];

  if (newStp) {
    const nextPos = pntBtw2Pnts(
      position,
      tilePosition(newStp.coord[0], newStp.coord[1], map.tsize, { x: 0, y: 0 }),
      element.speed
    );

    element.position = nextPos;
    const nextTile = tilePosition(newStp.coord[0], newStp.coord[1], map.tsize, {
      x: 0,
      y: 0,
    });
    if (
      Math.abs(Math.floor(nextPos.x) - nextTile.x) < 5 &&
      Math.abs(Math.floor(nextPos.y) - nextTile.y) < 5
    ) {
      element.path.splice(0, 1);
    }
  }

  return element;
};
function movingEntitity(start, steps, speed, loop = false) {
  return {
    start: { ...start },
    steps: [...steps],
    step: 0,
    position: { ...start },
    speed,
    easingSpeed: 150,
    easingFunc: easeInOutCubic,
    lastVisited: 0,
    easingTicks: 0,
    direction: 0,
    blocked: { t: false, r: false, b: false, l: false },
    loop,
    updatePath: Math.floor(Math.random() * 10),
    updatePathEvery: 20,
    maxPath: 400,
    run: goTo,
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

export function create403Entity(baseData) {
  return {
    ...createEnemyEntity(baseData),
    type: "403",
    render: render403,
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
    render: render401,
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
      const { ctx, map, canvas } = gameState.getByKeys([
        "ctx",
        "map",
        "canvas",
      ]);

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
      const f0f = gameState
        .getState("entities", [])
        .some((e) => e.type === "404");

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
    ttl: 5,
    onCollect: (element) => ({
      auth: {
        pickedOn: +new Date(),
        ttl: element.ttl * 1000,
        rem: element.ttl * 1000,
        authenticated: true,
        run: (eq) => {
          const passed = +new Date() - eq.pickedOn;
          const rem = eq.ttl - passed;
          if (rem <= 0) {
            return null;
          }
          return { ...eq, rem: eq.ttl - passed };
        },
      },
    }),
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
      const f0f = gameState
        .getState("entities", [])
        .some((e) => e.type === "404");

      if (!f0f) entity.opened = true;
      return entity;
    },
  });
}
