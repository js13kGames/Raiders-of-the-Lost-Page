import createState from "./state.js";
import { pxXSec2PxXFrame } from "./engine.js";
import { hide, show, domElement } from "./domUtils.js";

import createController, { addEventListener } from "./controller.js";
import { renderText } from "./rendering.js";
import { generateMap, setVOF } from "./map.js";

// game specific
import initPlayer from "./game_player.js";
import { initMainMenu, initPauseMenu } from "./game_menu.js";
/**
 *  This file contains all the demo game logic
 *
 * Everithing interacts with the gameState that is than exported
 */

const gameState = createState({
  showFps: true,
  tileSize: 10,
});

function demoControllers(gameState) {
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
      default:
        break;
    }
  };

  const onKeyUp = (event, ctrl, gameState) => {
    const keyName = event.key;

    switch (keyName) {
      case "ArrowUp":
      case "ArrowDown":
        gameState.setState("moveV", null);
      case "ArrowLeft":
      case "ArrowRight":
        gameState.setState("moveH", null);
      default:
        break;
    }
  };

  const initCtrl = {};

  const keyboardCtrl = createController(initCtrl);

  keyboardCtrl.render = (gameState) => {
    const renderCtrl = (msg, pos) =>
      renderText(gameState, msg, pos, "black", "60px sans-serif");
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

  const addKeyboardListener = (eventName, evtFunction) =>
    addEventListener(gameState, keyboardCtrl, eventName, evtFunction);

  addKeyboardListener("keydown", onKeyDown);
  addKeyboardListener("keyup", onKeyUp);
  gameState.addCtrl("main", keyboardCtrl);
}

gameState.updateGameStatus("init");

function startDemo(gameState) {
  gameState.removeAllCtrls();

  demoControllers(gameState);
  const canvas = gameState.getState("canvas");
  // create the map
  gameState.setState(
    "map",
    setVOF(
      generateMap(160, 120, gameState.getState("tileSize")),
      canvas.width,
      canvas.height
    )
  );
  const player = initPlayer(gameState);

  gameState.updateGameStatus("play").updateState((gameData) => ({
    ...gameData,
    player,
  }));
}
/**
 * Create the game elements
 */
// Menus
const pauseMenu = initPauseMenu(gameState);
const mainMenu = initMainMenu(gameState, startDemo);

// Add the menus to the game state
gameState.updateState((state) => {
  return { ...state, menus: { pause: pauseMenu, main: mainMenu } };
});

export default gameState;
