import createController, { addEventListener } from "./controller.js";
import { renderText } from "./rendering.js";
import createEntity from "./entities.js";
import { exportMap, canvasPosToTile } from "./map.js";

import { create404Entity } from "./game_entities.js";

export default function gameControllers(gameState) {
  // MAP GENERATION CONTROLLER
  const toggleTile = (event, ctrl, gameState) => {
    const { canvas, ctx, map, click, key } = gameState.getByKeys(["canvas", "ctx", "map", "click", "key"]);
    if (!click || !map) return;
    const x = event.pageX - canvas.offsetLeft;
    const y = event.pageY - canvas.offsetTop;
    let cnt = 10; // get in seconds
    const anim = createEntity({
      run: (gameState, element) => {
        element.position = { x, y };

        cnt--;
        if (cnt < 0) {
          return null;
        }
        return element;
      },
      render: (gameState, element) => {
        const { ctx } = gameState.getByKeys(["ctx"]);
        ctx.beginPath();
        ctx.fillStyle = "pink";

        ctx.arc(element.position.x, element.position.y, 1, 0, 2 * Math.PI);
        ctx.fill();
      },
    });

    const clickedTile = canvasPosToTile(x, y, canvas, map);
    const val = key === "d" ? 1 : 0;

    map.setTile(clickedTile.c, clickedTile.r, val === 0 ? 1 : 0);

    gameState.updateState((gameData) => ({
      ...gameData,
      entities: [...gameData.entities, anim],
    }));

    ctx.beginPath();
    ctx.fillStyle = "tomato";

    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fill();
  };
  const onClickDown = (event, ctrl, gameState) => {
    const { key, canvas, map } = gameState.getByKeys(["key", "canvas", "map"]);
    if (key === "e") {
      const x = event.pageX - canvas.offsetLeft;
      const y = event.pageY - canvas.offsetTop;
      const clickedTile = canvasPosToTile(x, y, canvas, map);
      gameState.updateState((gameData) => {
        const entities = [
          create404Entity({
            x: clickedTile.c * map.tsize,
            y: clickedTile.r * map.tsize,
          }),
          ...gameData.entities,
        ].reduce(
          (acc, val) => {
            if (val.type !== "404") {
              acc.vs.push(val);
            } else if (!acc.f) {
              //acc.f = true;
              acc.vs.push(val);
            }
            return acc;
          },
          { f: false, vs: [] }
        ).vs;

        return { ...gameData, entities };
      });
      //create404Entity
    } else {
      gameState.setState("click", true);
    }
  };
  const onClickUp = (event, ctrl, gameState) => {
    gameState.setState("click", false);
  };

  const onKeyDown = (event, ctrl, gameState) => {
    const keyName = event.key;
    switch (keyName) {
      case "ArrowUp":
        gameState.setState("moveV", "up");
        break;
      case "ArrowDown":
        gameState.setState("moveV", "down");
        break;
      case "ArrowLeft":
        gameState.setState("moveH", "left");
        break;
      case "ArrowRight":
        gameState.setState("moveH", "right");
        break;
      case "s":
        console.log(exportMap(gameState.getState("map"), gameState.getState("entities")));
        break;
      default:
        gameState.setState("key", keyName);
        break;
    }
  };

  const onKeyUp = (event, ctrl, gameState) => {
    const keyName = event.key;

    switch (keyName) {
      case "ArrowUp":
      case "ArrowDown":
        gameState.setState("moveV", null);
        break;
      case "ArrowLeft":
      case "ArrowRight":
        gameState.setState("moveH", null);
        break;
      default:
        gameState.setState("key", null);
        break;
    }
  };

  const initCtrl = {};

  const keyboardCtrl = createController(initCtrl);

  keyboardCtrl.render = (gameState) => {
    const renderCtrl = (msg, pos) => renderText(gameState, msg, pos, "black", "60px sans-serif");
    const mv = gameState.getState("moveV");
    const mh = gameState.getState("moveH");
    if (mv === "up") {
      renderCtrl("\u21E7", { x: 100, y: 100 });
    } else if (mv === "down") {
      renderCtrl("\u21E9", { x: 100, y: 100 });
    }
    if (mh === "left") {
      renderCtrl("\u21E6", { x: 100, y: 100 });
    } else if (mh === "right") {
      renderCtrl("\u21E8", { x: 100, y: 100 });
    }
  };

  const addKeyboardListener = (eventName, evtFunction) => addEventListener(gameState, keyboardCtrl, eventName, evtFunction);

  const mouseCtrl = createController({});
  const addMouseListener = (eventName, evtFunction) => addEventListener(gameState, mouseCtrl, eventName, evtFunction);

  addKeyboardListener("keydown", onKeyDown);
  addKeyboardListener("keyup", onKeyUp);
  addMouseListener("mousedown", onClickDown);
  addMouseListener("mouseup", onClickUp);
  addMouseListener("mousemove", toggleTile);

  gameState.addCtrl("main", keyboardCtrl);
  gameState.addCtrl("mouse", mouseCtrl);
}
