import createEntity from "./entities.js";
import { dstBtw2Pnts, pntBtw2Pnts, findPath, tilePosition } from "./map.js";
import { easeInOutCubic, drawFile } from "./rendering.js";
import { render403, render401 } from "./game_rendering.js";
import {pickExit} from "./game_audio.js"

const goTo = (gameState, element) => {
  const { map, player } = gameState.getByKeys(["map", "player"]);


  const { position, updatePathEvery, updatePath, maxPath } = element;
  if (player.ghost || dstBtw2Pnts(player.position, position) > maxPath) return element;

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
        pickExit(gameState);
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
