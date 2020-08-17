import createState from "./state.js";

import { generateMap, setVOF } from "./map.js";

// game specific
import initPlayer from "./game_player.js";
import { initMainMenu, initPauseMenu } from "./game_menu.js";
import { map1 } from "./game_maps.js";
import gameControllers from "./game_ctrls.js";
import { create404Entity, createEnemyEntity, createExitEntity } from "./game_entities.js";
import { setStageDim } from "./domUtils.js";

/**
 *  This file contains all the demo game logic
 *
 * Everithing interacts with the gameState that is than exported
 */

// Load from local storage

const unlockedLevels = 1;

// Starting the game

const tileSize = 3;

const gameState = createState({
  debug: false,
  showFps: true,
  unlockedLevels,
  tileSize,
});

gameState.updateGameStatus("init");

function loadLevel(map = null) {
  return (gameState) => {
    const { canvas } = gameState.getByKeys(["canvas"]);

    let startingMap = { tiles: null, entities: [] };
    if (map) startingMap = JSON.parse(map);
    gameState.setState("map", setVOF(generateMap(1200, 1200, tileSize, startingMap.tiles), canvas.width, canvas.height));
    const player = initPlayer(gameState);
    const entities = [];
    startingMap.entities.forEach((e) => {
      switch (e.type) {
        case "404":
          entities.push(create404Entity({ x: e.position.x, y: e.position.y }));
          break;
        case "enemy":
          entities.push(createEnemyEntity({ x: e.position.x, y: e.position.y }));
          break;
        case "exit":
          entities.push(createExitEntity({ x: e.position.x, y: e.position.y }));
          break;
        default:
          break;
      }
    });

    gameState.updateGameStatus("play").updateState((gameData) => ({ ...gameData, player, entities: [...entities] }));

    return gameState;
  };
}

// Menus

function initGame(gameState) {
  gameState.removeAllCtrls();
  const canvas = document.getElementById("stage");
  setStageDim(canvas);
  gameState.setState("canvas", canvas);
  gameState.setState("ctx", canvas.getContext("2d"));
  gameControllers(gameState);

  const levels = [map1, null];
  // load from localStorage

  const currentLevel = 0;
  gameState.updateState((gameData) => ({
    ...gameData,
    levels,
    currentLevel,
  }));

  const pauseMenu = initPauseMenu(gameState);
  const mainMenu = initMainMenu(gameState, loadLevel(levels[0]), levels.map(loadLevel));

  gameState.updateState((state) => {
    return { ...state, menus: { pause: pauseMenu, main: mainMenu } };
  });

  return gameState;
}

// Add the menus to the game state

export default initGame(gameState);
