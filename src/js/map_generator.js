import { isBorder, pntBtw2Pnts } from "./map.js";

function nearTiles(pos, visited, maxCol, maxRow) {
  const tiles = [
    [pos[0], pos[1] - 1],
    [pos[0] + 1, pos[1]],
    [pos[0], pos[1] + 1],
    [pos[0] - 1, pos[1]],
  ];

  return tiles.filter((t) => {
    return (
      t[0] >= 0 &&
      t[0] < maxCol &&
      t[1] >= 0 &&
      t[1] < maxRow &&
      !visited[`${t[0]}-${t[1]}`]
    );
  });
}

function relPos(p1, p2) {
  if (p1[1] - 1 === p2[1]) return 0;
  else if (p1[0] + 1 === p2[0]) return 1;
  else if (p1[1] + 1 === p2[1]) return 2;
  else if (p1[0] - 1 === p2[0]) return 3;
  else return false;
}

function scaleTiles(map, fact = 10) {
  return {
    ...map,
    cols: map.cols / fact,
    rows: map.rows / fact,
    tsize: map.tsize * fact,
  };
}

function square(pos, f, map, val, pad = 0) {
  for (let i = pad; i < f - pad; i++) {
    for (let j = pad; j < f - pad; j++) {
      const c = pos[0] * f + i;
      const r = pos[1] * f + j;
      if (!isBorder(c, r, map.cols, map.rows) && map.getTile(c, r) === 0) {
        map.setTile(c, r, val);
      }
    }
  }
}
function borders(pos, f, map, val, pad = 0, bord = [0, 1, 2, 3]) {
  if (!bord.length) return;
  const st = -pad;
  const end = f + pad;
  for (let i = st; i < end; i++) {
    for (let j = st; j < end; j++) {
      let ok = false;

      if (bord.indexOf(0) >= 0 && j <= 0) ok = true;
      else if (bord.indexOf(1) >= 0 && i >= f - 1) ok = true;
      else if (bord.indexOf(2) >= 0 && j >= f - 1) ok = true;
      else if (bord.indexOf(3) >= 0 && i <= 0) ok = true;

      const c = pos[0] * f + i;
      const r = pos[1] * f + j;
      if (!isBorder(c, r, map.cols, map.rows) && ok && map.getTile(c, r) >= 0) {
        map.setTile(c, r, val);
      }
    }
  }
}

function openWalls(scaledMap, start, arrive, walls) {
  let stack = [];
  let visited = {};
  let pos = start;
  let it = 0;

  const findWall = (walls, pos) =>
    walls.filter(
      (w) => `${pos[0]}-${pos[1]}` === `${w.pos[0]}-${w.pos[1]}`
    )[0] || {
      bords: [],
    };

  const maxTry = 1000;
  while (`${pos[0]}-${pos[1]}` !== `${arrive[0]}-${arrive[1]}` && it < maxTry) {
    it++;
    visited[`${pos[0]}-${pos[1]}`] = true;
    // BUG -> walls filter not consider border of near tiles!!!

    const w = findWall(walls, pos);
    const near = nearTiles(pos, visited, scaledMap.cols, scaledMap.rows);
    const nAv = near.filter(
      (n) =>
        w.bords.indexOf(relPos(pos, n)) < 0 &&
        findWall(walls, n).bords.indexOf(relPos(n, pos)) < 0
    );

    if (nAv.length > 0) {
      const rand = Math.floor(Math.random() * nAv.length);
      const next = nAv[rand];

      stack.push(pos);
      pos = next;
    } else {
      const nW = near
        .map((n) => findWall(walls, n))
        .filter((n) => n.bords.length > 0);

      if (w.bords.length) {
        /// TODO improve walls Removal

        walls = walls.map((w) => {
          if (
            `${pos[0]}-${pos[1]}` === `${w.pos[0]}-${w.pos[1]}` &&
            w.bords.length > 0
          ) {
            let rem = false;
            w.bords = w.bords.filter((b) => {
              if (!rem) {
                const toRem = near.map((n) => relPos(pos, n));
                const check = toRem.indexOf(b) >= 0;
                if (check) rem = true;
                return false;
              } else {
                return true;
              }
            });
            //w.bords.pop();
          }
          return w;
        });
      } else if (nW.length > 0) {
        const tr = nW[0];
        walls = walls.map((w) => {
          if (
            `${tr.pos[0]}-${tr.pos[1]}` === `${w.pos[0]}-${w.pos[1]}` &&
            w.bords.length > 0
          ) {
            const toRem = relPos(w.pos, pos);

            w.bords = w.bords.filter((b) => b !== toRem);
          }
          return w;
        });
      } else {
        stack.pop();
        pos = stack[stack.length - 1];
      }
    }

    if (!pos || it >= maxTry) {
      console.log("BLOCKED", start);
    }
  }

  console.log(
    "WALLS",
    start,
    walls.reduce((acc, v) => {
      acc += v.bords.length;
      return acc;
    }, 0)
  );

  return walls;
}

export function generateMaze(map) {
  const f = 10;
  let scaledMap = { ...scaleTiles(map, f) };
  const stack = [];
  const visited = {};
  const tilesNum = scaledMap.cols * scaledMap.rows;

  let pos = [scaledMap.cols / 2, scaledMap.rows / 2];
  let step = 0;

  let walls = [];

  while (Object.keys(visited).length < tilesNum) {
    visited[`${pos[0]}-${pos[1]}`] = true;
    const near = nearTiles(pos, visited, scaledMap.cols, scaledMap.rows);

    if (near.length > 0) {
      const rand = Math.floor(Math.random() * near.length);
      const next = near[rand];
      // find boder to draw
      const bords = [0, 1, 2, 3].filter((i) => {
        const isNext = i === relPos(pos, next);
        const isPrev =
          stack.length > 0 ? i === relPos(pos, stack[stack.length - 1]) : false;
        return !isNext && !isPrev;
      });

      walls.push({ pos, bords, step });

      stack.push(pos);
      pos = next;

      step++;
    } else {
      stack.pop();
      pos = stack[stack.length - 1];
    }
  }
  const c = [map.cols / 2, map.rows / 2];
  // console.log(
  //   "WALLS BEFORE",
  //   walls.reduce((acc, v) => {
  //     acc += v.bords.length;
  //     return acc;
  //   }, 0)
  // );
  // for (let i = 0; i < scaledMap.cols; i++) {
  //   for (let j = 0; j < scaledMap.rows; j++) {
  //     walls = openWalls(
  //       scaledMap,
  //       [i, j],
  //       [scaledMap.cols / 2, scaledMap.rows / 2],
  //       walls
  //     );
  //   }
  // }

  // console.log(
  //   "WALLS AFTER",
  //   walls.reduce((acc, v) => {
  //     acc += v.bords.length;
  //     return acc;
  //   }, 0)
  // );
  walls.forEach(({ pos, bords, step }) => {
    borders(pos, f, map, step, 0, bords);
    //square(pos, f, map, -1);
  });

  for (let i = -10; i < 10; i++) {
    for (let j = -10; j < 10; j++) {
      map.setTile(c[0] + i, c[1] + j, 0);
    }
  }

  return { ...map };
}
