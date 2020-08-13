export function renderText(
  gameState,
  msg,
  pos,
  color = "black",
  font = "10px sans-serif"
) {
  const ctx = gameState.getState("ctx");
  if (!ctx) return false;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.fillText(msg, pos.x, pos.y);
}
