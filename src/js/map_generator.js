import {
  isBorder,
  dstBtw2Pnts,
  isCenterBlock,
  surrounding,
  calcRoute,
  nearTiles,
  relPos,
  borders,
} from "./map.js";

function scaleTiles(map, fact = 10) {
  return {
    ...map,
    cols: map.cols / fact,
    rows: map.rows / fact,
    tsize: map.tsize * fact,
  };
}

function listLinked() {}
function linkedToCenter(start) {}
const findWall = (walls, pos) =>
  walls.filter(
    (w) => `${pos[0]}-${pos[1]}` === `${w.pos[0]}-${w.pos[1]}`
  )[0] || {
    bords: [],
  };

function openToCenter(start, arrive, walls, cols, rows) {
  let stack = [];
  let visited = {};
  let pos = start;
  let it = 0;

  const maxTry = 100;
  while (
    !!pos &&
    `${pos[0]}-${pos[1]}` !== `${arrive[0]}-${arrive[1]}` &&
    it < maxTry
  ) {
    it++;
    visited[`${pos[0]}-${pos[1]}`] = true;
    // BUG -> walls filter not consider border of near tiles!!!

    const w = findWall(walls, pos);
    const near = nearTiles(pos, visited, cols, rows);
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
      stack.pop();
      pos = stack[stack.length - 1];
    }
  }
  if (!pos || it >= maxTry) {
    return start;
  } else {
    return null;
  }
}

export function generateMaze(map, gameState) {
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
      gameState.setState("walls", walls);

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
    //entities.push(entityFn(t2p([50, 60], map.tsize)));
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
export function generateEntities(gameState, map, config = {}) {
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

  const blocked = centers.filter(([i, j]) => {
    return !calcRoute([i, j], [map.cols / 2, map.rows / 2], map);
  });

  gameState.updateState((stateData) => ({
    ...stateData,
    map: { ...stateData.map, centers, blocked },
  }));

  // TODO CHECK there are enough
  let entities = [];

  entities = [
    ...entities,
    ...addEntities(map, centers, config["404"].n, (position) => {
      return { position, type: "404" };
    }),
  ];
  entities = [
    ...entities,
    ...addEntities(map, centers, config["exit"].n, (position) => {
      return { position, type: "exit" };
    }),
  ];
  entities = [
    ...entities,
    ...addEntities(map, centers, config["auth"].n, (position) => {
      return { position, type: "auth" };
    }),
  ];
  entities = [
    ...entities,
    ...addEntities(map, centers, config["403"].n, (position) => {
      return {
        position,
        type: "403",
        speed:config["403"].speed || 3,       
      };
    }),
  ];
  entities = [
    ...entities,
    ...addEntities(map, centers, config["401"].n, (position) => {
      return {
        position,
        type: "401",
        speed: config["401"].speed || 3
      };
    }),
  ];

  return entities;
}
