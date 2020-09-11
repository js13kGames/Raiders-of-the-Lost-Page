// https://www.color-hex.com/color-palette/74007

export function resetBlur(ctx) {
  ctx.shadowBlur = 0;
}

export function genFont(fontConfig = {}) {
  const baseFont = { name: "arial", size: "14px", style: "" };

  const { name, size, style } = { ...baseFont, ...fontConfig };
  return `${style} ${size} ${name}`;
}

function setCtx(ctx, configuration = {}) {
  for (const k in configuration) {
    if (configuration.hasOwnProperty(k)) {
      ctx[k] = configuration[k];
    }
  }
}

function renderInCanvas(ctx, renderFn, ctxConfig = {}) {
  ctx.beginPath();
  setCtx(ctx, ctxConfig);

  renderFn(ctx);
}

export function renderText(gameState, msg, pos, color = "black", font = font({ size: "10px" })) {
  const ctx = gameState.getState("ctx");
  if (!ctx) return false;
  renderInCanvas(ctx, (ctx) => ctx.fillText(msg, pos.x, pos.y), { font, fillStyle: color });
}
export function drawPolygon(ctx, start, moves) {
  ctx.moveTo(start.x, start.y);
  moves.reduce((p, mv) => {
    const np = { x: p.x + mv[0], y: p.y + mv[1] };
    ctx.lineTo(np.x, np.y);
    return np;
  }, start);
}
export function drawFile(ctx, startingPoint, w, h, fold) {
  drawPolygon(ctx, startingPoint, [
    [w * 2 - fold, 0],
    [fold, fold],
    [0, h * 2 - fold],
    [-w * 2, 0],
    [0, -h * 2],
  ]);
}

export function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
