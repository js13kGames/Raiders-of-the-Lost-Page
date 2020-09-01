import createState from "./state.js";

import { generateMap, setVOF } from "./map.js";
import { generateMaze, generateEntities } from "./map_generator.js";
// game specific
import initPlayer from "./game_player.js";
import { initMainMenu, initPauseMenu, initGameOverMenu } from "./game_menu.js";
import { map1 } from "./game_maps.js";
import gameControllers from "./game_ctrls.js";
import {
  create404Entity,
  create403Entity,
  create401Entity,
  createExitEntity,
  createAuthEntity,
} from "./game_entities.js";
import { setStageDim } from "./domUtils.js";

/**
 *  This file contains all the demo game logic
 *
 * Everithing interacts with the gameState that is than exported
 */

// Load from local storage

const unlockedLevels = 1;
const levels = [map1, { cols: 100, rows: 100 }];
const startingLives = 3;

// Starting the game

const tileSize = 10;
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

function loadEntities(entitiesData) {
  const entitiesFactory = {
    404: create404Entity,
    auth: createAuthEntity,
    403: create403Entity,
    401: create401Entity,
    exit: createExitEntity,
  };
  return entitiesData
    .map((e) =>
      typeof entitiesFactory[e.type] === "function"
        ? entitiesFactory[e.type]({ ...e })
        : null
    )
    .filter((e) => !!e);
}

// TODO refactor
function loadLevel(baseMap = null, levelIdx = 0) {
  return (gameState) => {
    const { canvas } = gameState.getByKeys(["canvas"]);

    let startingMap = { tiles: null, entities: [], cols: null, rows: null };

    if (baseMap) {
      startingMap = {
        ...startingMap,
        ...(typeof baseMap === "string" ? JSON.parse(baseMap) : { ...baseMap }),
      };
    }
    const cols = startingMap.cols || 100;
    const rows = startingMap.rows || 100;

    const map = setVOF(
      generateMap(cols, rows, tileSize, startingMap.tiles),
      canvas.width,
      canvas.height
    );
    gameState.setState("map", {
      ...map,
      ...generateMaze(map, gameState),
    });
    const player = initPlayer(gameState);

    console.log(gameState.getState("map"));

    const entities = loadEntities(
      generateEntities(gameState, gameState.getState("map"))
    );

    gameState.updateGameStatus("play").updateState((gameData) => ({
      ...gameData,
      currentLevel: levelIdx,
      player: { ...player, equip: {} },
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
      // TODO create function for transition between states
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
