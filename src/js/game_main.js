import createState from "./state.js";
import { pxXSec2PxXFrame } from "./engine.js";
import { generateMap, setVOF, importTiles } from "./map.js";

// game specific
import initPlayer from "./game_player.js";
import { initMainMenu, initPauseMenu } from "./game_menu.js";
import { map1 } from "./game_maps.js";
import demoControllers from "./game_ctrls.js";
/**
 *  This file contains all the demo game logic
 *
 * Everithing interacts with the gameState that is than exported
 */

const gameState = createState({
  showFps: true,
  tileSize: 10,
});

gameState.updateGameStatus("init");

function startDemo(gameState) {
  gameState.removeAllCtrls();

  demoControllers(gameState);
  const canvas = gameState.getState("canvas");
  // create the map
  gameState.setState(
    "map",
    setVOF(
      generateMap(160, 120, gameState.getState("tileSize"), map1),
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
