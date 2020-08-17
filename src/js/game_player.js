import createEntity from "./entities.js";
import { pxXSecond } from "./map.js";

function renderFF(canvas, ctx, element) {
  ctx.beginPath();
  const px = canvas.width / 2;
  const py = canvas.height / 2;
  const playerAngle = element.angle || 0;
  //const angle = (3 / 2) * Math.PI;
  const angle = playerAngle ? playerAngle * Math.PI : 0;

  const center = ctx.createRadialGradient(px - 1, py - 2, 1, px, py, 10);
  center.addColorStop(0, "#7f00ff");
  center.addColorStop(1, "#e100ff");
  const fox = ctx.createRadialGradient(px, py - 2, 6, px + 5, py, 15);
  fox.addColorStop(0, "orange");
  fox.addColorStop(1, "red");

  ctx.fillStyle = center;

  ctx.lineWidth = 1;
  ctx.arc(px, py, 6, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.strokeStyle = fox;
  ctx.lineWidth = 6;
  ctx.arc(px, py, 8, Math.PI * 1.72 + angle, Math.PI * 1.22 + angle);
  ctx.stroke();
}

function playerCollideEnemy(gameState, player) {
  if (player.lives > 0) {
    gameState.updateState((gameData) => {
      return {
        ...gameData,
        player: {
          ...gameData.player,
          position: { ...gameData.player.lastPosition },
          lives: gameData.player.lives - 1,
        },
      };
    });
  } else {
    gameState.updateGameStatus("gameover");
  }
}
export default function initPlayer(gameState) {
  const playerData = gameState.getState("player");
  const map = gameState.getState("map");
  if (!map) {
    console.error("Map not defined");
    return;
  }
  const playerConfig = {
    r: 10,
    angle: 0,
    position: { x: (map.cols / 2) * map.tsize, y: (map.rows / 2) * map.tsize },
    lastPosition: {
      x: (map.cols / 2) * map.tsize,
      y: (map.rows / 2) * map.tsize,
    },
    player: true,
    pts: 0,
    render: (gameState, player) => {
      const { ctx, map, canvas } = gameState.getByKeys(["ctx", "map", "canvas"]);
      renderFF(canvas, ctx, player);
    },
    onCollide: (gameState, player, obstacle) => {
      if (obstacle.type === "404") {
        gameState.updateState((gameData) => {
          return {
            ...gameData,
            player: {
              ...player,
              lastPosition: { ...gameData.player.position },
              pts: gameData.player.pts + 1,
            },
            entities: [...gameData.entities.filter((e) => e.id !== obstacle.id)],
          };
        });
      } else if (obstacle.type === "enemy") {
        playerCollideEnemy(gameState, player);
      }
    },
    run: (gameState, element) => {
      const { moveV, moveH, map, tick } = gameState.getByKeys(["moveV", "moveH", "map", "tick"]);

      if (tick % 10 === 0) {
        //element.lastPosition = element.position;
      }
      const speed = pxXSecond(map, 0.8);

      if (element.borderCollide) {
        gameState.updateState((gameData) => {
          let cameraPos = gameData.map.cameraPos;
          const tsize = gameData.map.tsize;

          const newData = {
            ...gameData,
            map: { ...gameData.map, cameraPos },
          };
          return newData;
        });
      }

      const blocked = element.blocked;
      // TODO refactor
      if (moveV === "up" && moveH === "left") {
        element.angle = 1.8;
      } else if (moveV === "up" && moveH === "right") {
        element.angle = 2.3;
      } else if (moveV === "down" && moveH === "left") {
        element.angle = 1.3;
      } else if (moveV === "down" && moveH === "right") {
        element.angle = 2.8;
      } else if (moveV === "up") {
        element.angle = 0;
      } else if (moveV === "down") {
        element.angle = 1;
      } else if (moveH === "left") {
        element.angle = 1.5;
      } else if (moveH === "right") {
        element.angle = 2.5;
      }
      if (moveV === "up" && element.borderCollide !== "top" && !blocked.t) {
        element.position.y -= speed;
      } else if (moveV === "down" && element.borderCollide !== "bottom" && !blocked.b) {
        element.position.y += speed;
      }
      if (moveH === "left" && element.borderCollide !== "left" && !blocked.l) {
        element.position.x -= speed;
      } else if (moveH === "right" && element.borderCollide !== "right" && !blocked.r) {
        element.position.x += speed;
      }

      return element;
    },
  };

  const player = createEntity({ ...playerData, ...playerConfig });
  return player;
}
