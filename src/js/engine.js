import {
  renderText,
  renderHUD,
  genFont,
  resetBlur,
  drawPolygon,
} from "./rendering.js";
import {
  tileToCanvasPos,
  getTilesInView,
  isCenterBlock,
  isBorder,
} from "./map.js";
import { addClass, removeClass } from "./domUtils.js";
import { renderBackground } from "./game_rendering.js";

const loopSpeed = Math.round(1000 / 75);

function rowIndexToLetter(num, rows, height) {
  return String.fromCharCode(Math.floor(num / (height / rows)) + 97);
}

function generateSpacialHash(gameState) {
  const cols = 10;
  const row = 10;
  const { map, entities, player } = gameState.getByKeys([
    "map",
    "entities",
    "player",
  ]);

  const cW = canvas.width / cols;
  const rW = canvas.height / row;

  const hash = {};

  return hash;
}
function calcBlocked(elementTiles, map, ghost) {
  const blocked = { t: false, r: false, b: false, l: false };
  const vtx = elementTiles.reduce((acc, v) => {
    if (typeof acc.tr === "undefined" || v.r > acc.tr) {
      acc.tr = v.r;
    }
    if (typeof acc.br === "undefined" || v.r < acc.br) {
      acc.br = v.r;
    }
    if (typeof acc.tc === "undefined" || v.c > acc.tc) {
      acc.tc = v.c;
    }
    if (typeof acc.bc === "undefined" || v.c < acc.bc) {
      acc.bc = v.c;
    }
    return acc;
  }, {});

  const cs = [vtx.bc - 1, vtx.bc, vtx.tc + 1, vtx.tc];
  const rs = [vtx.br - 1, vtx.br, vtx.tr + 1, vtx.tr];
  for (const c of cs) {
    for (const r of rs) {
      const tile = map.getTile(c, r);
      const border = isBorder(c, r, map.cols, map.rows);

      if (tile > 0 && (border || !ghost)) {
        if (r === rs[0] && (c === cs[1] || c === cs[3])) {
          blocked.t = true;
        }
        if (r === rs[2] && (c === cs[1] || c === cs[3])) {
          blocked.b = true;
        }

        if (c === cs[0] && (r === rs[1] || r === rs[3])) {
          blocked.l = true;
        }
        if (c === cs[2] && (r === rs[1] || r === rs[3])) {
          blocked.r = true;
        }
      }
    }
  }

  return blocked;
}
function elementTiles(element, map) {
  const centerTile = {
    c: element.position.x / map.tsize,
    r: element.position.y / map.tsize,
  };

  const tiles = [];
  const dimension = Math.round(element.r / map.tsize);
  for (let c = -dimension; c < dimension; c++) {
    for (let r = -dimension; r < dimension; r++) {
      tiles.push({
        c: Math.round(centerTile.c + c),
        r: Math.round(centerTile.r + r),
      });
    }
  }

  return tiles;
}
export default function gameLoop(gameState) {
  const tick = gameState.getState("tick", 0);
  const now = +new Date();
  const lastTime = gameState.getState("lastTime", +new Date());
  const deltaTime = now - lastTime;
  const actualFps = Math.round(1000 / deltaTime);

  gameState.setState("actualFps", actualFps);
  gameState.setState("tick", tick + 1);

  // Improve collision detection
  // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection

  if (gameState.gameStatus() === "play") {
    let { player, map, ghost } = gameState.getByKeys([
      "player",
      "map",
      "ghost",
    ]);
    if (player && map) {
      const playerTile = {
        c: player.position.x / map.tsize,
        r: player.position.y / map.tsize,
      };
      player.currentTile = playerTile;
      //console.log(player.currentTile);
      gameState.updateState((gameData) => ({
        ...gameData,
        map: {
          ...gameData.map,
          centerTile: playerTile,
        },
      }));
      player = player.run(gameState, player);
      player.currentTiles = elementTiles(player, map);
      player.blocked = calcBlocked(player.currentTiles, map, ghost);

      gameState.setState("player", player);
    }

    gameState.updateState((gameData) => ({
      ...gameData,
      entities: gameData.entities
        .map((element) => {
          if (typeof element.run === "function") {
            element = element.run(gameState, element);

            if (element) {
              element.currentTiles = elementTiles(element, map);
              element.blocked = calcBlocked(element.currentTiles, map, ghost);
            }
          }
          return element;
        })
        .filter((element) => !!element),
    }));

    const startDebug = +new Date();

    // GENERATE SPACIAL HASH
    // const spacialHash = generateSpacialHash(gameState, cols, row);

    const elems = [
      ...(gameState.getState("entities") || []),
      gameState.getState("player"),
    ]
      .filter((e) => !!e && e.currentTiles)
      .map((e) => {
        e.tilesIds = e.currentTiles.map((t) => "c" + t.c + "r" + t.r);
        return e;
      })
      .filter((e) => e.collide);

    for (const subj of elems) {
      for (const el of elems) {
        if (
          subj.id !== el.id &&
          subj.tilesIds.some((t) => el.tilesIds.indexOf(t) >= 0)
        ) {
          if (typeof subj.onCollide === "function") {
            subj.onCollide(gameState, subj, el);
          }
        }
      }
    }
  }

  gameState.setState("lastTime", now);
  setTimeout(() => gameLoop(gameState), loopSpeed);
}
function calcAngleDegrees(x, y) {
  return (Math.atan2(y, x) * 180) / Math.PI;
}
function drawBox(gameState, entity) {
  const { ctx, canvas, map } = gameState.getByKeys(["ctx", "canvas", "map"]);
  if (!entity.currentTiles) return;

  ctx.beginPath(); // Start a new path
  ctx.strokeStyle = "green";
  ctx.lineWidth = 1;
  entity.currentTiles.forEach((t) => {
    const pos = tileToCanvasPos(t.c, t.r, canvas, map);
    ctx.rect(pos.x, pos.y, map.tsize, map.tsize);
  });

  ctx.stroke();
}

function mapTileInView(map, mapFn) {
  // to improve
  const { startCol, endCol, startRow, endRow } = getTilesInView(map);
  for (var r = startRow; r < endRow; r++) {
    for (var c = startCol; c < endCol; c++) {
      mapFn(c, r, { startRow, endRow, startCol, endCol });
    }
  }
}

export function renderLoop(gameState) {
  const renderFps = (msg, pos) =>
    renderText(gameState, msg, pos, "lime", genFont({ size: "10px" }));
  const { ctx, canvas, map, player, debug, ghost } = gameState.getByKeys([
    "ctx",
    "canvas",
    "map",
    "player",
    "debug",
    "ghost",
  ]);
  const status = gameState.gameStatus();
  // TODO refactor
  const classStatus = `status-${status}`;
  removeClass(canvas, "status-init");
  removeClass(canvas, "status-play");
  removeClass(canvas, "status-paused");
  removeClass(canvas, "status-gameover");
  removeClass(canvas, "status-died");
  addClass(canvas, classStatus);

  const lastTime = gameState.getState("lastTimeRender", +new Date());

  const now = +new Date();
  const deltaTime = now - lastTime;
  const actualFps = Math.round(1000 / deltaTime);

  gameState.setState("actualFpsRender", actualFps);

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // backgroundcons

    resetBlur(ctx);
    // draw Map

    if (gameState.gameStatus() === "play") {
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
        gameState.updateState((gameData) => ({
          ...gameData,
          map: { ...gameData.map, pov },
        }));
        function tilePosition(c, r, tsize, pov) {
          return {
            x: c * tsize + pov.x,
            y: r * tsize + pov.y,
          };
        }
        ctx.font = "10px Verdana";
        const borders = [];
        ctx.beginPath();
        ctx.fillStyle = `rgba(0,0,0,${ghost ? "0.5" : "1"})`;

        mapTileInView(map, (c, r, cols) => {
          const tile = map.getTile(c, r);
          const { x, y } = tilePosition(c, r, map.tsize, pov);
          if (isBorder(c, r, map.cols, map.rows)) {
            borders.push([c, r]);
          }
          if (tile > 0) {
            ctx.rect(x, y, map.tsize, map.tsize);
          }

          // if (isCenterBlock(c, r, map)) {
          //   ctx.arc(x, y, 2, 0, 2 * Math.PI);
          // }
        });
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(200,0,0,1)`;
        borders.forEach(([c, r]) => {
          const { x, y } = tilePosition(c, r, map.tsize, pov);
          ctx.rect(x, y, map.tsize, map.tsize);
        });
        ctx.fill();

        if (player && typeof player.render === "function") {
          player.render(gameState, player);
          if (debug) drawBox(gameState, player);
        }
        const { startCol, endCol, startRow, endRow } = getTilesInView(map);
        const entities = gameState.getState("entities", []);

        entities.forEach((element) => {
          if (typeof element.render === "function" && element.position) {
            const col = Math.round(element.position.x / map.tsize);
            const row = Math.round(element.position.y / map.tsize);
            if (
              (col >= startCol && col <= endCol) ||
              (row >= startRow && row <= endRow)
            ) {
              element.render(gameState, element, {
                x: element.position.x + pov.x,
                y: element.position.y + pov.y,
              });
            }

            if (debug) drawBox(gameState, element);
          }
        });
      }
    }

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

    if (gameState.gameStatus() === "play") renderHUD(gameState);

    renderFps(`${gameState.getState("actualFps")} FPS`, { x: 755, y: 90 });
    renderFps(`${gameState.getState("actualFpsRender")} FPSR`, {
      x: 755,
      y: 100,
    });

    if (player.currentTile) {
      renderFps(`c: ${player.currentTile.c},r: ${player.currentTile.r}`, {
        x: 750,
        y: 110,
      });
    }
  }

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
