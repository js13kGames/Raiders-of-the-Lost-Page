import createState from "./state.js"

import { generateMap, setVOF } from "./map.js"
import { generateMaze, generateEntities } from "./map_generator.js"
// game specific
import initPlayer from "./game_player.js"
import { initMainMenu, initPauseMenu, initGameOverMenu } from "./game_menu.js"
import { levels } from "./game_maps.js"
import gameControllers from "./game_ctrls.js"
import {
    create404Entity,
    create403Entity,
    create401Entity,
    createExitEntity,
    createAuthEntity,
} from "./game_entities.js"
import { setStageDim } from "./domUtils.js"

/**
 *  This file contains all the demo game logic
 *
 * Everithing interacts with the gameState that is than exported
 */

// Load from local storage

const unlockedLevels = 10

const startingLives = 3

// Starting the game

const tileSize = 10
function initGameState() {
    const state = createState({
        debug: false,
        audio: true,
        showFps: true,
        unlockedLevels,
        levels,
        tileSize,
        player: { lives: startingLives },
        loadingLetters: [],
    })
    const canvas = document.getElementById("stage")
    setStageDim(canvas, 800, 600)
    state.setState("canvas", canvas)
    state.setState("ctx", canvas.getContext("2d"))
    return state
}

function loadEntities(entitiesData) {
    const entitiesFactory = {
        404: create404Entity,
        auth: createAuthEntity,
        403: create403Entity,
        401: create401Entity,
        exit: createExitEntity,
    }
    return entitiesData
        .map((e) =>
            typeof entitiesFactory[e.type] === "function"
                ? entitiesFactory[e.type]({ ...e })
                : null
        )
        .filter((e) => !!e)
}

// TODO refactor
function loadLevel(levelConfig = {}, levelIdx = 0) {
    return (gameState) => {
        gameState.updateGameStatus("loading")

        const { canvas } = gameState.getByKeys(["canvas"])

        const cols = levelConfig.cols || 100
        const rows = levelConfig.rows || 100

        const map = setVOF(
            generateMap(cols, rows, tileSize),
            canvas.width,
            canvas.height
        )
        gameState.setState("map", {
            ...map,
            ...generateMaze(map, gameState),
        })
        const player = initPlayer(gameState)

        const entities = loadEntities(
            generateEntities(
                gameState,
                gameState.getState("map"),
                levelConfig.entities
            )
        )
        const mazeConfig = {
            resetPct: 90,
            groupPct: 60,
            wPct: 40,
            nextT: 600,
            nextRand: 300,
            nextMin: 200,
        }
        setTimeout(() => {
            gameState.updateGameStatus("play").updateState((gameData) => ({
                ...gameData,
                currentLevel: levelIdx,
                unlockedLevels: Math.min(levelIdx, gameData.levels.length),
                player: { ...player, equip: {} },
                entities: [...entities],
                levelConfig: mazeConfig,
            }))
        }, 200)

        return gameState
    }
}

// Menus

function initGame() {
    const gameState = initGameState()

    gameState.updateGameStatus("init")

    gameState.removeAllCtrls()

    gameControllers(gameState)
    // load from localStorage
    const currentLevel = 0

    const pauseMenu = initPauseMenu(gameState)
    const mainMenu = initMainMenu(
        gameState,
        loadLevel(levels[0]),
        levels.map(loadLevel)
    )

    const newLevel = (gameState) => {
        const { player, currentLevel, levels } = gameState.getByKeys([
            "player",
            "currentLevel",
            "levels",
        ])

        if (currentLevel < levels.length - 1) {
            // TODO create function for transition between states
            const nextLevel = currentLevel + 1
            //gameState.updateGameStatus("play");

            loadLevel(levels[nextLevel], nextLevel)(gameState)
        } else {
            gameState.updateGameStatus("finished")
        }
    }
    gameState.updateState((gameData) => ({ ...gameData, newLevel }))

    const gameOverMenu = initGameOverMenu(gameState, (gameState) => {
        gameState.updateState((gameData) => ({
            ...gameData,
            player: { lives: startingLives },
            entities: [],
        }))
        gameState.updateGameStatus("init")
    })

    gameState.updateState((state) => {
        return {
            ...state,
            menus: { pause: pauseMenu, main: mainMenu, gameover: gameOverMenu },
        }
    })

    return gameState
}

// Add the menus to the game state

export default initGame()
