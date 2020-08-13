/**
 * Application entry-point
 */

import gameLoop, { renderLoop } from "./engine.js";
import gameState from "./game_main.js";
import { setStageDim } from "./domUtils.js";

const canvas = document.getElementById("stage");
setStageDim(canvas);
gameState.setState("canvas", canvas);
gameState.setState("ctx", canvas.getContext("2d"));

// Starting the game loop
gameLoop(gameState);
renderLoop(gameState);
