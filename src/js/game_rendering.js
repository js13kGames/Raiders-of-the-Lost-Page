import { findPoint2Angle } from "./utils.js";
import { mapTileInView, tilePosition, isBorder } from "./map.js";

function circleWithSlashes(ctx, center, r, slashes = []) {
  ctx.arc(center.x, center.y, r, 0, 2 * Math.PI);
  slashes.forEach((s) => {
    const start = findPoint2Angle(s[0], center, r);
    ctx.moveTo(start.x, start.y);
    const end = findPoint2Angle(s[1], center, r);
    ctx.lineTo(end.x, end.y);
  });
}

export function render403(gameState, element, relPos) {
  const { ctx } = gameState.getByKeys(["ctx"]);
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
}

export function render401(gameState, element, relPos) {
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
}

export function renderBackground(ctx, canvas, map, pov) {
  ctx.lineWidth = 0.3;
  ctx.beginPath();

  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0, 0.4)";
  ctx.fill();
  ctx.beginPath();

  for (let r = 0; r < map.rows * map.tsize; r += 100) {
    for (let c = 0; c < map.cols * map.tsize; c += 100) {
      ctx.arc(c + pov.x, r + pov.y, 100, 0, 2 * Math.PI);
    }
  }
  ctx.strokeStyle = "purple";
  ctx.stroke();
}

export function renderTiles(gameState) {
  const { ctx, map, ghost, levelConfig } = gameState.getByKeys([
    "ctx",
    "map",
    "ghost",
    "levelConfig",
  ]);
  const { pov } = map;
  ctx.font = "10px Verdana";
  const borders = [];
  ctx.beginPath();
  if (levelConfig) {
    ctx.fillStyle = `rgba(0,250,0,1)`;
  } else {
    ctx.fillStyle = `rgba(0,0,0,${ghost ? "0.5" : "1"})`;
  }

  mapTileInView(map, (c, r, cols) => {
    const tile = map.getTile(c, r);
    const { x, y } = tilePosition(c, r, map.tsize, pov);
    if (isBorder(c, r, map.cols, map.rows)) {
      borders.push([c, r]);
    }
    if (tile > 0) {
      ctx.rect(x, y, map.tsize, map.tsize);
    }

    // if (isCenterBlock(c, r, map)) {
    //   ctx.arc(x, y, 2, 0, 2 * Math.PI);
    // }
  });
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = `rgba(200,0,0,1)`;
  borders.forEach(([c, r]) => {
    const { x, y } = tilePosition(c, r, map.tsize, pov);
    ctx.rect(x, y, map.tsize, map.tsize);
  });
  ctx.fill();
}
