import { d1, d2, d5, viewportDims, d3 } from "./domUtils.js"
import {
    renderTutorialEnemy,
    renderTutorial404,
    renderTutorialExitOpen,
    renderTutorialExitClose,
    renderTutorialAuth
} from "./game_rendering.js"
import { setStageDim } from "./domUtils.js"
import { setVOF } from "./map.js"

function createMenu(gameState, initFunc) {
    return initFunc({}, gameState)
}

export function initMainMenu(gameState, startFn, levelsFn, restartFn) {
    const mainMenu = createMenu(gameState, (menu, gameState) => {
        const menuContainer = d1("#mm-container"),
            startBtn = d1("#mm-start"),
            continueBtn = d1("#mm-continue"),
            audioButton = d1("#mm-sound"),
            congratulation = d1("#congrats-screen"),
            howToBtn = d1("#mm-how-to"),
            changeSizeBtn = d1("#main-screen-size"),
            howToScreen = d1("#tutorial"),
            escTutorialBtn = d1("#esc-tutorial"),
            continueMaxBtn = d1("#mm-continue-max")
        startBtn.addEventListener("click", (evt) => {
            evt.preventDefault()
            startFn(gameState)
        })

        continueBtn.addEventListener("click", (evt) => {
            evt.preventDefault()
            gameState.updateGameStatus("play")
        })

        audioButton.addEventListener("click", (evt) => {
            evt.preventDefault()
            gameState.setState("audio", !gameState.getState("audio"))
        })

        howToBtn.addEventListener("click", (evt) => {
            evt.preventDefault()
            gameState.setState("prevState", gameState.gameStatus())

            gameState.updateGameStatus("tutorial")
        })
        escTutorialBtn.addEventListener("click", (evt) => {
            evt.preventDefault()
            gameState.updateGameStatus(gameState.getState("prevState"))
        })

        continueMaxBtn.addEventListener("click", (evt) => {
            evt.preventDefault()
            levelsFn[gameState.getState("maxReached")](gameState)
        })

        const rstButton = d1("#restart-btn-finished")

        rstButton.addEventListener("click", (evt) => {
            evt.preventDefault()

            if (
                gameState.gameStatus() === "gameover" ||
                gameState.gameStatus() === "finished"
            ) {
                restartFn(gameState)
            }
        })

        changeSizeBtn.addEventListener("click", (evt) => {
            evt.preventDefault()
            const {
                canvas,
                screenSizeAv,
                currentScreenSize
            } = gameState.gbk([
                "canvas",
                "screenSizeAv",
                "currentScreenSize"
            ])
            screenSizeAv[0] = viewportDims()
            const n = (currentScreenSize + 1) % screenSizeAv.length
            setStageDim(
                canvas,
                document.getElementById("s-c"),
                screenSizeAv[n][0],
                screenSizeAv[n][1]
            )
            gameState.updateState((gameData) => ({
                ...gameData,
                canvas,
                currentScreenSize: n,
                screenSizeAv,
                map: setVOF(gameData.map, canvas.width, canvas.height)
            }))
        })

        renderTutorialEnemy(d1("#tutorial-enemy-canvas"))
        renderTutorial404(d1("#tutorial-404-canvas"))
        renderTutorialExitOpen(d1("#tutorial-exit-open"))
        renderTutorialExitClose(d1("#tutorial-exit-close"))
        renderTutorialAuth(d1("#tutorial-auth"))

        const m = {
            render: (gameState) => {
                const {audio, currentLevel,maxReached} = gameState.gbk(["audio", "currentLevel", "maxReached"])


                if (typeof currentLevel !== "undefined") {
                    continueBtn.innerText = `Continue Level ${currentLevel+1}`
                }

                if (maxReached) {
                    d5(continueMaxBtn)
                    continueMaxBtn.innerText = `Load Level ${maxReached+1}`
                } else {
                    d2(continueMaxBtn)
                }
                if (audio) {
                    audioButton.innerText = "Disable Sound"
                } else {
                    audioButton.innerText = "Enable Sound"
                }

                switch (gameState.gameStatus()) {
                    case "tutorial":
                        d2(continueBtn)
                        d2(menuContainer)
                        d2(startBtn)
                        d5(howToScreen)
                        break
                    case "paused":
                        d5(continueBtn)
                        d5(menuContainer)
                        d5(startBtn)
                        d2(howToScreen)
                        break
                    case "init":
                        d2(continueBtn)
                        d5(startBtn)
                        d5(menuContainer)
                        d2(howToScreen)
                        d2(congratulation)
                        break
                    case "finished":
                        d2(continueBtn)
                        d5(congratulation, "flex")
                        d2(startBtn)
                        d2(menuContainer)
                        d2(howToScreen)
                        break
                    case "play":
                        d2(menuContainer)
                        d2(congratulation)
                        d2(howToScreen)
                        break

                    default:
                        d2(howToScreen)
                        d2(menuContainer)
                }
            }
        }
        return { ...menu, ...m }
    })

    return mainMenu
}

export function initPauseMenu(gameState) {
    const pauseMenu = createMenu(gameState, (menu, gameState) => {
        const button = d1("#play-pause-btn")
        const element = d1("#pmc")
        const menuInit = {
            d5: () => d5(element),
            d2: () => d2(element),
            element: element,
            button: button,
            render: (gameState) => {
                // Dynamic menu ps
                const canvas = gameState.getState("canvas")
                element.style.position = "absolute"

                element.style.top = `${canvas.height - 60}px`
                element.style.left = `${canvas.width - 50}px`
                if (gameState.gameStatus() === "play") {
                    d5(element)
                } else {
                    d2(element)
                }
            }
        }

        button.addEventListener("click", (evt) => {
            evt.preventDefault()
            if (gameState.gameStatus() === "paused") {
                gameState.updateGameStatus("play")
            } else {
                gameState.updateGameStatus("paused")
            }
        })
        return { ...menu, ...menuInit }
    })
    return pauseMenu
}

export function initGameOverMenu(gameState, startFn) {
    const gameoverMenu = createMenu(gameState, (menu, gameState) => {
        const button = d1("#restart-btn-died")
        const element = d1("#game-over-menu")
        const menuInit = {
            element: element,
            button: button,
            render: (gameState) => {
                // Dynamic menu ps
                if (gameState.gameStatus() === "gameover") {
                    d5(element, "flex")

                    d3(element, "fade-in")
                } else {
                    d3(element, "fade-out")
                    d2(element)
                }
            }
        }

        button.addEventListener("click", (evt) => {
            evt.preventDefault()
            if (
                gameState.gameStatus() === "gameover" ||
                gameState.gameStatus() === "finished"
            ) {
                startFn(gameState)
            }
        })
        return { ...menu, ...menuInit }
    })
    return gameoverMenu
}
