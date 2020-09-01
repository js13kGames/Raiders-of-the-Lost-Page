import { findPoint2Angle } from "./utils.js";

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
  // for (let c = 0; c < map.cols * map.tsize; c += 100) {
  //   ctx.moveTo(c + pov.x, 0);
  //   ctx.lineTo(c + pov.x, canvas.height);
  // }
  // ctx.strokeStyle = "pink";
  // ctx.stroke();
  // ctx.beginPath();
  // for (let r = 0; r < map.rows * map.tsize; r += 100) {
  //   ctx.moveTo(0, r + pov.y);
  //   ctx.lineTo(canvas.width, r + pov.y);
  // }

  for (let r = 0; r < map.rows * map.tsize; r += 100) {
    for (let c = 0; c < map.cols * map.tsize; c += 100) {
      ctx.arc(c + pov.x, r + pov.y, 100, 0, 2 * Math.PI);
    }
  }
  ctx.strokeStyle = "purple";
  ctx.stroke();
}
