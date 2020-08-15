function generateTileContent(cols, rows, c, r) {}

function isBorder(c, r, cols, rows) {
  return c === 0 || r === 0 || r === rows - 1 || c === cols - 1;
}
export function getTilesInView(map) {
  if (!map.centerTile) return {};

  return {
    startCol: Math.max(0, Math.round(map.centerTile.c - map.viewCols / 2)),
    endCol: Math.min(map.cols, Math.round(map.centerTile.c + map.viewCols / 2)),
    startRow: Math.max(0, Math.round(map.centerTile.r - map.viewRows / 2)),
    endRow: Math.min(map.rows, Math.round(map.centerTile.r + map.viewRows / 2)),
  };
}
export function exportMap(map, entities) {
  const tiles = {};
  for (let r = 0; r < map.rows; r++) {
    for (let c = 0; c < map.cols; c++) {
      if (!isBorder(c, r, map.cols, map.rows)) {
        const tile = map.getTile(c, r);
        if (tile) {
          tiles["" + c + "-" + r] = tile;
        }
      }
    }
  }
  const exptEntities = entities.map((e) => ({
    position: e.start || e.position,
    type: e.type,
  }));

  return JSON.stringify({ tiles, entities: exptEntities });
}
export function canvasPosToTile(x, y, canvas, map) {
  const rel = { x: x / canvas.width, y: y / canvas.height };

  const { startCol, endCol, startRow, endRow } = getTilesInView(map);

  return {
    c: Math.round((endCol - startCol) * rel.x + startCol),
    r: Math.round((endRow - startRow) * rel.y + startRow),
  };
}

export function tileToCanvasPos(c, r, canvas, map) {
  return {
    x: Math.round(c * map.tsize + map.pov.x),
    y: Math.round(r * map.tsize + map.pov.y),
  };
}

export function pxXSecond(map, tXs) {
  return tXs * map.tsize;
}
export function generateMap(width, height, tsize = 4, loadMap = null) {
  let tiles = [];

  const cols = Math.ceil(width / tsize);
  const rows = Math.ceil(height / tsize);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (isBorder(c, r, cols, rows)) {
        tiles.push(1);
      } else if (loadMap && loadMap["" + c + "-" + r]) {
        tiles.push(loadMap["" + c + "-" + r]);
      } else {
        tiles.push(0);
      }
    }
  }

  const map = {
    cols,
    rows,
    tsize,
    tiles,
    getTile: (col, row) => map.tiles[row * map.cols + col],
    setTile: (col, row, val) => (map.tiles[row * map.cols + col] = val),
    renderTile: () => null,
  };

  return map;
}

export function setVOF(map, width, height) {
  if (!map) {
    console.error("Map is null");
    return;
  }
  const visibleWidth = Math.ceil(width / map.tsize);
  const visibleHeight = Math.ceil(height / map.tsize);
  const viewCols = Math.min(map.cols, visibleWidth);
  const viewRows = Math.min(map.rows, visibleHeight);

  const camera = {
    viewCols: viewCols,
    viewRows: viewRows,
  };

  return { ...map, ...camera };
}

export function dstBtw2Pnts(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}
export function pntBtw2Pnts(p1, p2, dist) {
  const ptsDist = dstBtw2Pnts(p1, p2);
  if (ptsDist < dist) {
    return { ...p2 };
  }
  const distRatio = ptsDist ? dist / ptsDist : 0;
  return {
    x: p1.x + distRatio * (p2.x - p1.x),
    y: p1.y + distRatio * (p2.y - p1.y),
  };
}
