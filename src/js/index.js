/**
 * Application entry-point
 */

import gameLoop, { renderLoop } from "./engine.js"
import initGame from "./game_main.js"

;(() => {
    const gameState = initGame()
    gameLoop(gameState)
    renderLoop(gameState)
})()
// Starting the game loop
