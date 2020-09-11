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

function renderLivesHUD(gameState) {
  const { canvas, ctx, player } = gameState.getByKeys(["canvas", "ctx", "player"]);
  const lives = player.lives;
  const fontSize = 20;
  const font = `${fontSize}px sans-serif`;

  ctx.font = font;
  const metrics = ctx.measureText("\u{2764}");

  let livestr = [];
  const charForLine = Math.floor((fontSize * 3) / metrics.width);

  for (let i = 0; i < lives; i++) {
    const rowIdx = Math.floor(i / charForLine);
    if (!livestr[rowIdx]) livestr[rowIdx] = "";
    livestr[rowIdx] += " \u{2764}";
  }
  const pos = { x: canvas.width - 100, y: 30 };

  const liveColor = ctx.createRadialGradient(pos.x, pos.y, 15, pos.x, pos.y, 50);
  liveColor.addColorStop(0, "#f52789");
  liveColor.addColorStop(1, "#e900ff");
  ctx.font = font;
  ctx.strokeStyle = liveColor;
  ctx.lineWidth = 2.5;
  livestr.forEach((line, idx) => {
    ctx.strokeText(line, pos.x, pos.y + fontSize * idx);
  });
}

function renderCurrentLevelHUD(gameState) {
  const { currentLevel, canvas, ctx } = gameState.getByKeys(["currentLevel", "canvas", "ctx"]);
  const fontSize = 20;
  const font = `${fontSize}px sans-serif`;
  const levelstr = `Level: ${currentLevel + 1}`;
  ctx.font = font;
  const pos = { x: 30, y: 30 };

  const liveColor = ctx.createRadialGradient(pos.x, pos.y, 15, pos.x, pos.y, 50);
  liveColor.addColorStop(0, "#f52789");
  liveColor.addColorStop(1, "#e900ff");
  ctx.font = font;
  ctx.fillStyle = liveColor;

  ctx.fillText(levelstr, pos.x, pos.y);
}

export function renderHUD(gameState) {
  const { canvas, ctx } = gameState.getByKeys(["currentLevel", "canvas", "ctx"]);
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, 50);

  ctx.fillStyle = "rgba(0,0,0,0.9)";
  ctx.fill();

  renderLivesHUD(gameState);
  renderCurrentLevelHUD(gameState);
}

export function easeInSine(x) {
  return 1 - Math.cos((x * Math.PI) / 2);
}
export function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
