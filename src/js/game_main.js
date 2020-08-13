import createState from "./state.js";
import { pxXSec2PxXFrame } from "./engine.js";
import { generateMap, setVOF } from "./map.js";

// game specific
import initPlayer from "./game_player.js";
import { initMainMenu, initPauseMenu } from "./game_menu.js";
import { map1 } from "./game_maps.js";
import demoControllers from "./game_ctrls.js";
import { create404Entity } from "./game_entities.js";
/**
 *  This file contains all the demo game logic
 *
 * Everithing interacts with the gameState that is than exported
 */

const tileSize = 4;
const gameState = createState({
  debug: false,
  showFps: true,
  tileSize,
});

gameState.updateGameStatus("init");

function startDemo(gameState) {
  gameState.removeAllCtrls();
  // -------- develop
  let importMap = { tiles: null, entities: [] };
  if (map1) importMap = JSON.parse(map1);

  // -------- end develop
  demoControllers(gameState);
  const canvas = gameState.getState("canvas");
  // create the map
  gameState.setState(
    "map",
    setVOF(
      generateMap(1200, 1200, tileSize, importMap.tiles),
      canvas.width,
      canvas.height
    )
  );
  const player = initPlayer(gameState);
  const entities = [];
  importMap.entities.forEach((e) => {
    switch (e.type) {
      case "404":
        entities.push(create404Entity({ x: e.position.x, y: e.position.y }));
        break;
      default:
        break;
    }
  });

  gameState.updateGameStatus("play").updateState((gameData) => ({
    ...gameData,
    player,
    entities,
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
