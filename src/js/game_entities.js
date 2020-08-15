import createEntity from "./entities.js";

export function create404Entity(position) {
  const entity = createEntity({
    position,
    type: "404",
    r: 10,
    render: (gameState, element, relPos) => {
      const { ctx, map, canvas } = gameState.getByKeys([
        "ctx",
        "map",
        "canvas",
      ]);

      ctx.beginPath();
      ctx.fillStyle = "blue";

      ctx.arc(relPos.x, relPos.y, element.r, 0, 2 * Math.PI);
      ctx.fill();
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
      const { ctx, map, canvas } = gameState.getByKeys([
        "ctx",
        "map",
        "canvas",
      ]);

      ctx.beginPath();
      ctx.fillStyle = element.opened ? "green" : "red";

      ctx.arc(relPos.x, relPos.y, element.r, 0, 2 * Math.PI);
      ctx.fill();
    },
    onCollide: (gameState, entity, oth) => {
      if (oth.player && entity.opened) {
        console.log("WIIIIIn");
      }
    },
    run: (gameState, entity) => {
      const f0f = gameState
        .getState("entities", [])
        .some((e) => e.type === "404");

      if (!f0f) entity.opened = true;
      return entity;
    },
  });

  return entity;
}

function movingEntitity(start, end, speed) {
  return {
    start: { ...start },
    end: { ...end },
    position: { ...start },
    speed,
    direction: 0,
    run: (gameState, element) => {
      if (element.position.x < element.end.x && element.direction === 0) {
        element.position.x += speed;
      } else if (
        element.position.x > element.start.x &&
        element.direction === 1
      ) {
        element.position.x -= speed;
      } else if (element.position.x >= element.end.x) {
        element.direction = 1;
      } else if (element.position.x <= element.start.x) {
        element.direction = 0;
      }

      return element;
    },
  };
}

export function createEnemyEntity(position) {
  const speed = 2;
  const entity = createEntity({
    ...movingEntitity(position, { x: position.x + 100, y: position.y }, speed),

    type: "enemy",
    r: 10,

    render: (gameState, element, relPos) => {
      const { ctx, map, canvas } = gameState.getByKeys([
        "ctx",
        "map",
        "canvas",
      ]);

      ctx.beginPath();
      ctx.fillStyle = "tomato";

      ctx.arc(relPos.x, relPos.y, element.r, 0, 2 * Math.PI);
      ctx.fill();
    },
  });

  return entity;
}
