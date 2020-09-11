import createEntity, { removeEntityById } from "./entities.js"
import { pxXSecond } from "./map.js"
import { easeInOutCubic, resetBlur } from "./rendering.js"
import { domElement, addClass, removeClass, hide, show } from "./domUtils.js"
import { partial, compose } from "./utils.js"
import { pick404, lifeLost } from "./game_audio.js"

function renderFF(canvas, ctx, element) {
    const { auth = false } = element.equip || {}
    const ghost = element.ghost ? "0.5": "1"
    const px = canvas.width / 2
    const py = canvas.height / 2
    const playerAngle = element.angle || 0
    //const angle = (3 / 2) * Math.PI;
    const angle = playerAngle ? playerAngle * Math.PI : 0

    const center = ctx.createRadialGradient(px - 1, py - 2, 1, px, py, 10)
    center.addColorStop(0, `rgba(127, 0, 255, ${ghost})`)
    center.addColorStop(1, `rgba(127, 0, 255, ${ghost})`)
    const fox = ctx.createRadialGradient(px, py - 2, 6, px + 5, py, 15)
    fox.addColorStop(0, `rgba(255,165,0, ${ghost})`)
    fox.addColorStop(1, `rgba(255,0,0, ${ghost})`)

    ctx.fillStyle = center

    ctx.lineWidth = 1
    ctx.beginPath()
    if (auth) {
        ctx.shadowBlur = 3
        ctx.shadowColor = "orange"
    }
    ctx.arc(px, py, 6, 0, 2 * Math.PI)
    ctx.fill()
    resetBlur(ctx)
    ctx.beginPath()
    ctx.strokeStyle = fox
    ctx.lineWidth = 6
    if (auth) {
        ctx.shadowBlur = 3
        ctx.shadowColor = "#e100ff"
    }
    ctx.arc(px, py, 8, Math.PI * 1.72 + angle, Math.PI * 1.22 + angle)

    ctx.stroke()
    resetBlur(ctx)
    if (auth) {
        if (auth.rem < 3000) {
            const factor = Math.sin(auth.rem / 100)
            ctx.lineWidth = 3 + factor
            ctx.shadowBlur = 10 + factor
        } else {
            ctx.lineWidth = 3
            ctx.shadowBlur = 10
        }

        ctx.beginPath()
        ctx.strokeStyle = "lime"
        ctx.shadowColor = "lime"

        ctx.arc(px, py, 13, Math.PI * 1.72 + angle, Math.PI * 1.22 + angle)
        ctx.stroke()
        ctx
        resetBlur(ctx)
    }
}
// Utility functions
function changePlayerPosition(newPosition, gameData) {
    return {
        ...gameData,
        player: {
            ...gameData.player,
            position: { ...newPosition },
        },
    }
}

function changePlayerLive(updateFn, gameData) {
    return {
        ...gameData,
        player: {
            ...gameData.player,
            lives: updateFn(gameData.player.lives),
        },
    }
}
function playerPickup404(pointAdded, gameData) {
    return {
        ...gameData,
        player: {
            ...gameData.player,
            lastPosition: { ...gameData.player.position },
            pts: gameData.player.pts + pointAdded,
        },
    }
}

function setPlayerGhost(val, gameData) {
    return {
        ...gameData,
        player: {
            ...gameData.player,
            ghost: val,
        },
    }
}

//
function playerCollideEnemy(gameState, player) {
  const dieDuration = 3000;
  const ghostDuration = 2000;
  const playerResume = 2500

  if (player.ghost) return;
    const youDiedEl = domElement(".you-died-screen")
    const canvas = gameState.getState("canvas")
    if (player.lives > 0) {
        //TODO refactor move this to a function
        gameState.updateGameStatus("died")
        lifeLost(gameState)
        show(youDiedEl, "flex")
        addClass(youDiedEl, "fade-in-out")
        addClass(canvas, "fade-in")
        canvas.style.opacity = 0
        setTimeout(() => {
            canvas.style.opacity = 1
            removeClass(canvas, "fade-in")

            setTimeout(() => {
                gameState.updateState((gameData) => {
                    return setPlayerGhost(false, gameData)
                })
            }, ghostDuration)
        }, dieDuration)
        setTimeout(() => {
            gameState.updateState((gameData) => {
                removeClass(youDiedEl, "fade-in-out")
                return compose(
                    partial(changePlayerLive, (l) => l - 1),
                    partial(changePlayerPosition, gameData.player.lastPosition),
                    partial(setPlayerGhost, true)
                )(gameData)
            })

            gameState.updateGameStatus("play")

            hide(youDiedEl)
        }, playerResume)
    } else {
        gameState.updateGameStatus("gameover")
    }
}
export default function initPlayer(gameState) {
    const playerData = gameState.getState("player")
    const map = gameState.getState("map")
    if (!map) {
        console.error("Map not defined")
        return
    }
    const playerConfig = {
        pxSpeed: 0.5,
        r: 10,
        angle: 0,
        position: {
            x: (map.cols / 2) * map.tsize,
            y: (map.rows / 2) * map.tsize,
        },
        lastPosition: {
            x: (map.cols / 2) * map.tsize,
            y: (map.rows / 2) * map.tsize,
        },
        player: true,
        movingTicks: 0,
        pts: 0,
        collide: true,
        render: (gameState, player) => {
            const { ctx, canvas } = gameState.getByKeys([
                "ctx",
                "map",
                "canvas",
            ])
            renderFF(canvas, ctx, player)
        },
        onCollide: (gameState, player, obstacle) => {
          if (player.ghost) return;
            // refactor the if
            if (obstacle.type === "404") {
                pick404(gameState)
                gameState.updateState(
                    compose(
                        partial(playerPickup404, 1),
                        partial(removeEntityById, obstacle.id)
                    )
                )
            } else if (obstacle.enemy) {
                playerCollideEnemy(gameState, player)
            } else if (typeof obstacle.onCollect === "function") {
                gameState.updateState(
                    compose((gameData) => {
                        return {
                            ...gameData,
                            player: {
                                ...gameData.player,
                                equip: {
                                    ...gameData.player.equip,
                                    ...obstacle.onCollect(obstacle),
                                },
                            },
                        }
                    }, partial(removeEntityById, obstacle.id))
                )
            }
        },
        run: (gameState, element) => {
            const { moveV, moveH, map } = gameState.getByKeys([
                "moveV",
                "moveH",
                "map",
            ])
            const speed = pxXSecond(map, element.pxSpeed)
            const equip = element.equip
            for (const k in equip) {
                if (equip.hasOwnProperty(k)) {
                    const eq = equip[k]
                    if (eq && typeof eq.run === "function") {
                        element.equip[k] = eq.run(eq)
                    }
                }
            }

            if (element.borderCollide) {
                gameState.updateState((gameData) => {
                    let cameraPos = gameData.map.cameraPos
                    const newData = {
                        ...gameData,
                        map: { ...gameData.map, cameraPos },
                    }
                    return newData
                })
            }

            const blocked = element.blocked
            // TODO refactor
            if (moveV === "up" && moveH === "left") {
                element.angle = 1.8
            } else if (moveV === "up" && moveH === "right") {
                element.angle = 2.3
            } else if (moveV === "down" && moveH === "left") {
                element.angle = 1.3
            } else if (moveV === "down" && moveH === "right") {
                element.angle = 2.8
            } else if (moveV === "up") {
                element.angle = 0
            } else if (moveV === "down") {
                element.angle = 1
            } else if (moveH === "left") {
                element.angle = 1.5
            } else if (moveH === "right") {
                element.angle = 2.5
            }
            const animSpeed = 2
            const speedMult = Math.min(
                1,
                easeInOutCubic(element.movingTicks / animSpeed)
            )
            if (
                moveV === "up" &&
                element.borderCollide !== "top" &&
                !blocked.t
            ) {
                element.position.y -= speed * speedMult
            } else if (
                moveV === "down" &&
                element.borderCollide !== "bottom" &&
                !blocked.b
            ) {
                element.position.y += speed * speedMult
            }
            if (
                moveH === "left" &&
                element.borderCollide !== "left" &&
                !blocked.l
            ) {
                element.position.x -= speed * speedMult
            } else if (
                moveH === "right" &&
                element.borderCollide !== "right" &&
                !blocked.r
            ) {
                element.position.x += speed * speedMult
            }

            if (!moveH && !moveV) {
                element.movingTicks = 0
            } else {
                element.movingTicks++
            }
            return element
        },
    }

    const player = createEntity({ ...playerData, ...playerConfig })
    return player
}
