function generateTileContent(cols, rows, c, r) {}

function isBorder(c, r, cols, rows) {
  return c === 0 || r === 0 || r === rows - 1 || c === cols - 1;
}
export function importTiles(tiles) {
  return JSON.parse(tiles);
}

export function exportMap(map) {
  const tiles = {};
  for (let r = 0; r < map.rows; r++) {
    for (let c = 0; c < map.cols; c++) {
      const tile = map.getTile(c, r);
      if (tile) {
        tiles["" + c + "-" + r] = tile;
      }
    }
  }

  return JSON.stringify(tiles);
}
export function generateMap(width, height, tsize = 4, loadMap = null) {
  let tiles = [];

  const cols = width;
  const rows = height;
  if (loadMap) {
    const tileData = importTiles(loadMap);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (tileData["" + c + "-" + r]) {
          tiles.push(tileData["" + c + "-" + r]);
        } else {
          tiles.push(0);
        }
      }
    }
  } else {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (isBorder(c, r, cols, rows)) {
          tiles.push(1);
        } else {
          tiles.push(0);
        }
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
