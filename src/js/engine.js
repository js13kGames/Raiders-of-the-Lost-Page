import { renderText } from "./rendering.js";

const loopSpeed = Math.round(1000 / 60);
const cols = 100;
const row = 100;

function rowIndexToLetter(num, rows, height) {
  return String.fromCharCode(Math.floor(num / (height / rows)) + 97);
}

function generateSpacialHash(gameState) {
  const cols = 10;
  const row = 10;
  const entities = gameState.getState("entities", []);

  const canvas = gameState.getState("canvas");
  const cW = canvas.width / cols;
  const rW = canvas.height / row;

  const hash = entities.reduce(
    (acc, val) => {
      const pos = val.position;

      const c = Math.floor(pos.x / (canvas.width / cols));
      const r = rowIndexToLetter(pos.y, row, canvas.height);
      const idx = c + "-" + r;
      acc[idx] = acc[idx] || [];
      acc[idx].push(val);
      return acc;
    },
    { config: { cols: cols, row: row } }
  );

  return hash;
}
function calcBlocked(elementTile, map) {
  const blocked = { t: false, r: false, b: false, l: false };

  for (let c = -1; c <= 1; c++) {
    for (let r = -1; r <= 1; r++) {
      const tileC = Math.floor(elementTile.c) + c;
      const tileR = Math.floor(elementTile.r) + r;
      const tile = map.getTile(tileC, tileR);
      if (!!tile) {
        if (c === 0 && r === -1) {
          blocked.t = true;
        }
        if (c === 0 && r === 1) {
          blocked.b = true;
        }

        if (c === -1 && r === 0) {
          blocked.l = true;
        }
        if (c === 1 && r === 0) {
          blocked.r = true;
        }
      }
    }
  }

  return blocked;
}
export default function gameLoop(gameState) {
  const tick = gameState.getState("tick", 0);
  const now = +new Date();
  const lastTime = gameState.getState("lastTime", +new Date());
  const deltaTime = now - lastTime;
  const actualFps = Math.round(1000 / deltaTime);

  gameState.setState("actualFps", actualFps);
  gameState.setState("tick", tick + 1);

  // Handle entities

  // TODO
  // -

  // Improve collision detection
  // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection

  const { player, map } = gameState.getByKeys(["player", "map"]);
  if (player && map) {
    const playerTile = {
      c: player.position.x / map.tsize,
      r: player.position.y / map.tsize,
    };

    gameState.updateState((gameData) => ({
      ...gameData,
      map: {
        ...gameData.map,
        centerTile: playerTile,
      },
      player: player.run(gameState, player),
    }));

    player.blocked = calcBlocked(playerTile, map);
  }

  gameState.updateState((gameData) => ({
    ...gameData,
    entities: gameData.entities
      .map((element) => {
        if (typeof element.run === "function") {
          element = element.run(gameState, element);
        }
        return element;
      })
      .filter((element) => !!element),
  }));

  //console.log(player);
  // gameState.updateState((gameData) => ({
  //   ...gameData,
  //   entities: gameState
  //     .getState("entities", [])
  //     .map((element) => {
  //       const map = gameData.map;

  //       if (!element.position && element.player) {
  //         // set starting player position
  //         element.position = {
  //           x: (map.cols / 2) * map.tsize,
  //           y: (map.rows / 2) * map.tsize,
  //         };
  //       }
  //       const tiledPos = {
  //         x: element.position.x / map.tsize,
  //         y: element.position.y / map.tsize,
  //       };
  //       const currentTile = {
  //         c: Math.floor(tiledPos.x),
  //         r: Math.floor(tiledPos.y),
  //       };

  //       const adj = [];

  //       for (let r = -1; r <= 1; r++) {
  //         for (let c = -1; c <= 1; c++) {
  //           adj.push(map.getTile(currentTile.c + c, currentTile.r + r));
  //         }
  //       }
  //       element.adj = adj;

  //       if (element.position.x <= 0) {
  //         element.borderCollide = "left";
  //       } else if (element.position.x >= canvas.width) {
  //         element.borderCollide = "right";
  //       } else if (element.position.y <= 0) {
  //         element.borderCollide = "top";
  //       } else if (element.position.y >= canvas.height) {
  //         element.borderCollide = "bottom";
  //       } else {
  //         element.borderCollide = null;
  //       }

  //       element.tiledPos = tiledPos;
  //       element.currentTile = currentTile;
  //       if (typeof element.run === "function") {
  //         element = element.run(gameState, element);
  //       }
  //       return element;
  //     })

  //     .filter((element) => !!element),
  // }));

  const startDebug = +new Date();

  // const spacialHash = generateSpacialHash(gameState, cols, row);

  // gameState
  //   .getState("entities", [])
  //   .map((el) => {
  //     el.isColliding = false;
  //     return el;
  //   })
  //   .forEach((element) => {
  //     for (let k in spacialHash) {
  //       if (k !== "config" && spacialHash.hasOwnProperty(k)) {
  //         if (spacialHash[k].some((v) => v.id === element.id)) {
  //           const ks = k.split("-");
  //           const c = parseInt(ks[0], 10);
  //           const r = ks[1].charCodeAt(0);
  //           let adj = [...spacialHash[k]];
  //           for (let i = 0; i < adj.length; i++) {
  //             if (
  //               (element.moving || adj[i].moving) &&
  //               adj[i].id !== element.id &&
  //               element.canCollide &&
  //               collide(element, adj[i])
  //             ) {
  //               element.isColliding = true;
  //             }
  //           }
  //         }
  //       }
  //     }
  //     return element;
  //   });
  //console.log("end", +new Date() - startDebug);

  gameState.setState("lastTime", now);
  setTimeout(() => gameLoop(gameState), loopSpeed);
}

function drawBox(gameState, entity) {
  if (typeof entity.collideBox !== "function") return false;
  const { ctx, map } = gameState.getByKeys(["ctx", "map"]);

  ctx.beginPath(); // Start a new path
  ctx.strokeStyle = "red";
  // adjust with pov
  const cb = entity.collideBox(entity);
  ctx.moveTo(cb.a, cb.c);
  ctx.lineTo(cb.a, cb.d);
  ctx.lineTo(cb.b, cb.d);
  ctx.lineTo(cb.b, cb.c);
  ctx.lineTo(cb.a, cb.c);
  ctx.stroke();
  // ctx.strokeStyle = "blue";
  // ctx.rect(
  //   Math.floor(entity.position.x / map.tsize),
  //   Math.floor(entity.position.y / map.tsize),
  //   map.tsize,
  //   map.tsize
  // );
  // ctx.stroke();
}
function mapTileInView(map, mapFn) {
  // to improve
  const startCol = 0;
  const endCol = map.cols;
  const startRow = 0;
  const endRow = map.rows;

  for (var r = startRow; r < endRow; r++) {
    for (var c = startCol; c < endCol; c++) {
      mapFn(c, r);
    }
  }
}

export function renderLoop(gameState) {
  const renderFps = (msg, pos) =>
    renderText(gameState, msg, pos, "green", "10px sans-serif");
  const { ctx, canvas, map, player } = gameState.getByKeys([
    "ctx",
    "canvas",
    "map",
    "player",
  ]);
  const lastTime = gameState.getState("lastTimeRender", +new Date());

  const now = +new Date();
  const deltaTime = now - lastTime;
  const actualFps = Math.round(1000 / deltaTime);

  gameState.setState("actualFpsRender", actualFps);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw Map
  if (map && map.centerTile && player) {
    const playerTile = map.centerTile;

    const canvasCenter = { x: canvas.width / 2, y: canvas.height / 2 };
    const mapCenter = {
      x: ((map.cols * playerTile.c) / map.cols) * map.tsize,
      y: ((map.rows * playerTile.r) / map.rows) * map.tsize,
    };

    const pov = {
      x: canvasCenter.x - mapCenter.x,
      y: canvasCenter.y - mapCenter.y,
    };

    ctx.beginPath();
    ctx.fillStyle = "black";

    mapTileInView(map, (c, r) => {
      var tile = map.getTile(c, r);
      if (tile === 1) {
        const { x, y } = { x: c * map.tsize + pov.x, y: r * map.tsize + pov.y };

        ctx.rect(x, y, map.tsize, map.tsize);
      }
    });
    ctx.fill();
  }

  renderFps(`${gameState.getState("actualFps")} FPS`, { x: 755, y: 580 });
  renderFps(`${gameState.getState("actualFpsRender")} FPSR`, {
    x: 755,
    y: 590,
  });

  const entities = gameState.getState("entities", []);
  const menus = gameState.getState("menus");
  const ctrls = gameState.getState("ctrls");

  // Render menus
  for (const menuName in menus) {
    if (menus.hasOwnProperty(menuName)) {
      const menu = menus[menuName];
      if (typeof menu.render === "function") {
        menu.render(gameState);
      }
    }
  }
  for (const ctrlName in ctrls) {
    if (ctrls.hasOwnProperty(ctrlName)) {
      const ctrl = ctrls[ctrlName];
      if (typeof ctrl.render === "function") {
        ctrl.render(gameState);
      }
    }
  }

  // render player

  if (player && typeof player.render === "function") {
    player.render(gameState, player);
    //drawBox(gameState, player);
  }

  entities.forEach((element) => {
    if (typeof element.render === "function" && element.position) {
      element.render(gameState, element);
      drawBox(gameState, element);
    }
  });
  gameState.setState("lastTimeRender", now);

  window.requestAnimationFrame(() => renderLoop(gameState));
}
export function pxXSec2PxXFrame(px, gameState) {
  const fps = gameState.getState("actualFps");
  return px / fps;
}

export function collide(el1, el2) {
  const rect1 = { ...el1.position, ...el1.box };
  const rect2 = { ...el2.position, ...el2.box };

  if (
    typeof el1.collideBox === "function" &&
    typeof el2.collideBox === "function"
  ) {
    const cb1 = el1.collideBox(el1);
    const cb2 = el2.collideBox(el2);
    return cb1.a < cb2.b && cb1.b > cb2.a && cb1.c < cb2.d && cb1.d > cb2.c;
  } else {
    return false;
  }
}
