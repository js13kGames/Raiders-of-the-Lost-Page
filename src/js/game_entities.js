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
      ctx.fillStyle = "tomato";

      ctx.arc(relPos.x, relPos.y, element.r, 0, 2 * Math.PI);
      ctx.fill();
    },
  });

  return entity;
}
