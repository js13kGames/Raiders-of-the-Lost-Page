import { domElement, hide, show, viewportDims, addClass } from "./domUtils.js"
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
        const menuContainer = domElement("#mm-container"),
            startBtn = domElement("#mm-start"),
            continueBtn = domElement("#mm-continue"),
            audioButton = domElement("#mm-sound"),
            congratulation = domElement("#congrats-screen"),
            howToBtn = domElement("#mm-how-to"),
            changeSizeBtn = domElement("#main-screen-size"),
            howToScreen = domElement("#tutorial"),
            escTutorialBtn = domElement("#esc-tutorial"),
            continueMaxBtn = domElement("#mm-continue-max")
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

        const rstButton = domElement("#restart-btn-finished")

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
            } = gameState.getByKeys([
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

        renderTutorialEnemy(domElement("#tutorial-enemy-canvas"))
        renderTutorial404(domElement("#tutorial-404-canvas"))
        renderTutorialExitOpen(domElement("#tutorial-exit-open"))
        renderTutorialExitClose(domElement("#tutorial-exit-close"))
        renderTutorialAuth(domElement("#tutorial-auth"))

        const m = {
            render: (gameState) => {
                const {audio, currentLevel,maxReached} = gameState.getByKeys(["audio", "currentLevel", "maxReached"])


                if (typeof currentLevel !== "undefined") {
                    continueBtn.innerText = `Continue Level ${currentLevel+1}`
                }

                if (maxReached) {
                    show(continueMaxBtn)
                    continueMaxBtn.innerText = `Load Level ${maxReached+1}`
                } else {
                    hide(continueMaxBtn)
                }
                if (audio) {
                    audioButton.innerText = "Disable Sound"
                } else {
                    audioButton.innerText = "Enable Sound"
                }

                switch (gameState.gameStatus()) {
                    case "tutorial":
                        hide(continueBtn)
                        hide(menuContainer)
                        hide(startBtn)
                        show(howToScreen)
                        break
                    case "paused":
                        show(continueBtn)
                        show(menuContainer)
                        show(startBtn)
                        hide(howToScreen)
                        break
                    case "init":
                        hide(continueBtn)
                        show(startBtn)
                        show(menuContainer)
                        hide(howToScreen)
                        hide(congratulation)
                        break
                    case "finished":
                        hide(continueBtn)
                        show(congratulation, "flex")
                        hide(startBtn)
                        hide(menuContainer)
                        hide(howToScreen)
                        break
                    case "play":
                        hide(menuContainer)
                        hide(congratulation)
                        hide(howToScreen)
                        break

                    default:
                        hide(howToScreen)
                        hide(menuContainer)
                }
            }
        }
        return { ...menu, ...m }
    })

    return mainMenu
}

export function initPauseMenu(gameState) {
    const pauseMenu = createMenu(gameState, (menu, gameState) => {
        const button = domElement("#play-pause-btn")
        const element = domElement("#pmc")
        const menuInit = {
            show: () => show(element),
            hide: () => hide(element),
            element: element,
            button: button,
            render: (gameState) => {
                // Dynamic menu ps
                const canvas = gameState.getState("canvas")
                element.style.ps = "absolute"

                element.style.top = `${canvas.height - 50}px`
                element.style.left = `${canvas.width - 100}px`
                if (gameState.gameStatus() === "play") {
                    show(element)
                } else {
                    hide(element)
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
        const button = domElement("#restart-btn-died")
        const element = domElement("#game-over-menu")
        const menuInit = {
            element: element,
            button: button,
            render: (gameState) => {
                // Dynamic menu ps
                if (gameState.gameStatus() === "gameover") {
                    show(element, "flex")

                    addClass(element, "fade-in")
                } else {
                    addClass(element, "fade-out")
                    hide(element)
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
