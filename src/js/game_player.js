import createEntity from "./entities.js";

export default function initPlayer(gameState) {
  const map = gameState.getState("map");
  if (!map) {
    console.error("Map not defined");
    return;
  }

  const player = createEntity({
    box: { w: 5, h: 5 },
    position: { x: (map.cols / 2) * map.tsize, y: (map.rows / 2) * map.tsize },
    player: true,
    render: (gameState, player) => {
      const { ctx, map, canvas } = gameState.getByKeys([
        "ctx",
        "map",
        "canvas",
      ]);
      ctx.beginPath();
      ctx.fillStyle = "pink";

      ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, 2 * Math.PI);
      ctx.fill();
    },
    collideBox: (element) => {
      const canvas = gameState.getState("canvas");
      return {
        a: canvas.width / 2 - element.box.w,
        b: canvas.width / 2 + element.box.w,
        c: canvas.height / 2 - element.box.h,
        d: canvas.height / 2 + element.box.h,
      };
    },
    run: (gameState, element) => {
      const { moveV, moveH, map } = gameState.getByKeys([
        "moveV",
        "moveH",
        "map",
      ]);

      const speed = 1.2;
      if (element.borderCollide) {
        gameState.updateState((gameData) => {
          let cameraPos = gameData.map.cameraPos;
          const tsize = gameData.map.tsize;

          switch (element.borderCollide) {
            case "left":
              cameraPos.x--;
              element.position.x += tsize;
              break;
            case "right":
              cameraPos.x++;
              element.position.x -= tsize;
              break;
            case "top":
              cameraPos.y--;
              element.position.y += tsize;
              break;
            case "bottom":
              cameraPos.y++;
              element.position.y -= tsize;
              break;
          }
          const newData = {
            ...gameData,
            map: { ...gameData.map, cameraPos },
          };
          return newData;
        });
      }

      const blocked = element.blocked;

      if (moveV === "up" && element.borderCollide !== "top" && !blocked.t) {
        element.position.y -= speed;
      } else if (
        moveV === "down" &&
        element.borderCollide !== "bottom" &&
        !blocked.b
      ) {
        element.position.y += speed;
      }
      if (moveH === "left" && element.borderCollide !== "left" && !blocked.l) {
        element.position.x -= speed;
      } else if (
        moveH === "right" &&
        element.borderCollide !== "right" &&
        !blocked.r
      ) {
        element.position.x += speed;
      }

      return element;
    },
  });
  return player;
}
