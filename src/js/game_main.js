import createState from "./state.js";

import { generateMap, setVOF } from "./map.js";

// game specific
import initPlayer from "./game_player.js";
import { initMainMenu, initPauseMenu, initGameOverMenu } from "./game_menu.js";
import { map1 } from "./game_maps.js";
import gameControllers from "./game_ctrls.js";
import {
  create404Entity,
  createEnemyEntity,
  createExitEntity,
} from "./game_entities.js";
import { setStageDim } from "./domUtils.js";

/**
 *  This file contains all the demo game logic
 *
 * Everithing interacts with the gameState that is than exported
 */

// Load from local storage

const unlockedLevels = 1;
const levels = [map1, { cols: 200, rows: 200 }];
const startingLives = 3;

// Starting the game

const tileSize = 3;
function initGameState() {
  const state = createState({
    debug: false,
    showFps: true,
    unlockedLevels,
    levels,
    tileSize,
    player: { lives: startingLives },
  });
  const canvas = document.getElementById("stage");
  setStageDim(canvas);
  state.setState("canvas", canvas);
  state.setState("ctx", canvas.getContext("2d"));
  return state;
}

function loadLevel(map = null, levelIdx = 0) {
  return (gameState) => {
    const { canvas } = gameState.getByKeys(["canvas"]);

    let startingMap = { tiles: null, entities: [], cols: null, rows: null };

    if (map) {
      startingMap = {
        ...startingMap,
        ...(typeof map === "string" ? JSON.parse(map) : { ...map }),
      };
    }
    gameState.setState(
      "map",
      setVOF(
        generateMap(
          startingMap.cols || 400,
          startingMap.rows || 400,
          tileSize,
          startingMap.tiles
        ),
        canvas.width,
        canvas.height
      )
    );
    const player = initPlayer(gameState);
    const entities = [];
    startingMap.entities.forEach((e) => {
      switch (e.type) {
        case "404":
          entities.push(create404Entity({ x: e.position.x, y: e.position.y }));
          break;
        case "enemy":
          entities.push(
            createEnemyEntity({ x: e.position.x, y: e.position.y })
          );
          break;
        case "exit":
          entities.push(createExitEntity({ x: e.position.x, y: e.position.y }));
          break;
        default:
          break;
      }
    });

    gameState.updateGameStatus("play").updateState((gameData) => ({
      ...gameData,
      currentLevel: levelIdx,
      player,
      entities: [...entities],
    }));

    return gameState;
  };
}

// Menus

function initGame() {
  const gameState = initGameState();

  gameState.updateGameStatus("init");

  gameState.removeAllCtrls();

  gameControllers(gameState);
  // load from localStorage
  const currentLevel = 0;

  const pauseMenu = initPauseMenu(gameState);
  const mainMenu = initMainMenu(
    gameState,
    loadLevel(levels[0]),
    levels.map(loadLevel)
  );

  const newLevel = (gameState) => {
    const { player, currentLevel, levels } = gameState.getByKeys([
      "player",
      "currentLevel",
      "levels",
    ]);

    if (currentLevel !== levels.length - 1) {
      debugger;
      const nextLevel = currentLevel + 1;
      //gameState.updateGameStatus("play");

      loadLevel(levels[nextLevel])(gameState);
    }
  };
  gameState.updateState((gameData) => ({ ...gameData, newLevel }));

  const gameOverMenu = initGameOverMenu(gameState, (gameState) => {
    gameState.updateState((gameData) => ({
      ...gameData,
      player: { lives: startingLives },
      entities: [],
    }));
    gameState.updateGameStatus("init");
  });

  gameState.updateState((state) => {
    return {
      ...state,
      menus: { pause: pauseMenu, main: mainMenu, gameover: gameOverMenu },
    };
  });

  return gameState;
}

// Add the menus to the game state

export default initGame();
