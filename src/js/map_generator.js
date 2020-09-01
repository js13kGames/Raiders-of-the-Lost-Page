import { isBorder, dstBtw2Pnts, isCenterBlock, surrounding } from "./map.js";

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

  walls.forEach(({ pos, bords, step }) => {
    borders(pos, f, map, step, 0, bords);
  });

  for (let i = -10; i < 10; i++) {
    for (let j = -10; j < 10; j++) {
      map.setTile(c[0] + i, c[1] + j, 0);
    }
  }
  return { ...map, scaleFactor: f };
}

const t2p = (t, tsize) => ({ x: t[0] * tsize, y: t[1] * tsize });

function addEntities(map, centers, num, entityFn) {
  const entities = [];
  for (let i = 0; i < num; i++) {
    // choosen Random
    const idx = Math.floor(Math.random() * centers.length);
    const sel = centers.splice(idx, 1)[0];
    entities.push(entityFn(t2p(sel, map.tsize)));
  }

  return entities;
}

function generateSteps(center, num) {
  const mDist = 100;
  const steps = [];
  for (let i = 0; i < num; i++) {
    // choosen Random
    const { x, y } = {
      x: center.x + Math.floor(Math.random() * mDist),
      y: center.y + Math.floor(Math.random() * mDist),
    };
    steps.push({ x, y });
  }

  return steps;
}
// Note: entities should be placed near to each other (guardians???)
export function generateEntities(map) {
  const config = {
    404: 5,
    403: 3,
    401: 3,
    auth: 0,
  };
  const range = 1;
  const minDist = 20;
  const originCenters = map
    .tCoords()
    .filter(
      ([c, r]) =>
        isCenterBlock(c, r, map) &&
        !map.getTile(c, r) &&
        surrounding(map, [c, r], range).every(
          ([cc, cr]) => map.getTile(cc, cr) === 0
        )
    )
    .filter(([c, r]) => {
      const p1 = { x: map.centerTile.c, y: map.centerTile.r };
      return dstBtw2Pnts(p1, { x: c, y: r }) > minDist;
    });
  let centers = [...originCenters];

  // TODO CHECK there are enough
  let entities = [];

  entities = [
    ...entities,
    ...addEntities(map, centers, config["404"], (position) => {
      return { position, type: "404" };
    }),
  ];

  entities = [
    ...entities,
    ...addEntities(map, centers, config["403"], (position) => {
      return {
        position,
        type: "403",
        speed: Math.floor(Math.random() * 5) + 2,
        // steps: [{ x: position.x + 200, y: position.y }],
        steps: generateSteps(position, Math.floor(Math.random() * 5) + 1),
      };
    }),
  ];
  entities = [
    ...entities,
    ...addEntities(map, centers, config["401"], (position) => {
      return {
        position,
        type: "401",
        speed: Math.floor(Math.random() * 5) + 2,
        steps: generateSteps(position, Math.floor(Math.random() * 5) + 1),
      };
    }),
  ];

  return entities;
}
