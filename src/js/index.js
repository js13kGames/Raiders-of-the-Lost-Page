/**
 * Application entry-point
 */

import gameLoop, { renderLoop } from "./engine.js";
import gameState from "./game_main.js";

// Starting the game loop
gameLoop(gameState);
renderLoop(gameState);
