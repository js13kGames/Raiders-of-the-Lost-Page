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
      ctx.fillStyle = "green";

      ctx.arc(relPos.x, relPos.y, element.r, 0, 2 * Math.PI);
      ctx.fill();
    },
  });

  return entity;
}

export function createEnemyEntity(position) {
  const speed = 3;
  const entity = createEntity({
    start: { ...position },
    end: { x: position.x + 100, y: position.y },
    position: { ...position },
    direction: 0,
    type: "enemy",
    r: 10,
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
