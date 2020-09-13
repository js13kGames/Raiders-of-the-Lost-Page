import { renderText, genFont, resetBlur } from "./rendering.js"
import {
    getTilesInView,
    isBorder,
    mazeBorders,
    clearCenterMap
} from "./map.js"
import { d3, d4 } from "./domUtils.js"
import { renderTiles, renderArrows, renderHUD } from "./game_rendering.js"
import { reverseDirs } from "./utils.js"

const loopSpeed = Math.round(1000 / 75)

function calcblk(elementTiles, map) {
    const blk = { t: false, r: false, b: false, l: false }
    const vtx = elementTiles.reduce((acc, v) => {
        if (typeof acc.tr === "undefined" || v.r > acc.tr) {
            acc.tr = v.r
        }
        if (typeof acc.br === "undefined" || v.r < acc.br) {
            acc.br = v.r
        }
        if (typeof acc.tc === "undefined" || v.c > acc.tc) {
            acc.tc = v.c
        }
        if (typeof acc.bc === "undefined" || v.c < acc.bc) {
            acc.bc = v.c
        }
        return acc
    }, {})

    const cs = [vtx.bc - 1, vtx.bc, vtx.tc + 1, vtx.tc]
    const rs = [vtx.br - 1, vtx.br, vtx.tr + 1, vtx.tr]
    for (const c of cs) {
        for (const r of rs) {
            const tile = map.getTile(c, r)
            const border = isBorder(c, r, map.cols, map.rows)

            if (tile > 0 || border) {
                if (r === rs[0] && (c === cs[1] || c === cs[3])) {
                    blk.t = true
                }
                if (r === rs[2] && (c === cs[1] || c === cs[3])) {
                    blk.b = true
                }

                if (c === cs[0] && (r === rs[1] || r === rs[3])) {
                    blk.l = true
                }
                if (c === cs[2] && (r === rs[1] || r === rs[3])) {
                    blk.r = true
                }
            }
        }
    }

    return blk
}
function elementTiles(element, map) {
    const centerTile = {
        c: element.ps.x / map.tsize,
        r: element.ps.y / map.tsize
    }

    const tiles = []
    const dimension = Math.max(Math.round(element.r / map.tsize), 1)
    for (let c = -dimension; c < dimension; c++) {
        for (let r = -dimension; r < dimension; r++) {
            tiles.push({
                c: Math.round(centerTile.c + c),
                r: Math.round(centerTile.r + r)
            })
        }
    }

    return tiles
}
const chance = (ch) => Math.floor(Math.random() * 100) <= ch

const updateWalls = (gameState, map) => {
    const percRem = 10
    const { mazepath } = gameState.gbk(["mazepath"])
    for (const k in mazepath) {
        if (mazepath.hasOwnProperty(k)) {
            const missing = reverseDirs(mazepath[k])
            mazepath[k] = [
                ...mazepath[k],
                ...missing.filter(() => chance(percRem))
            ]
        }
    }

    mazeBorders(map, mazepath, map.sf)
    clearCenterMap(map, [
        Math.floor(map.cols / 2),
        Math.floor(map.rows / 2),
        10
    ])

    gameState.setState("mazepath", mazepath)
}

export default function gameLoop(gameState) {
    const tick = gameState.getState("tick", 0),
        now = +new Date(),
        lastTime = gameState.getState("lastTime", +new Date()),
        deltaTime = now - lastTime,
        actualFps = Math.round(1000 / deltaTime)

    gameState.setState("actualFps", actualFps)
    gameState.setState("tick", tick + 1)

    if (gameState.gameStatus() === "play") {
        let { player, map, levelConfig } = gameState.gbk([
            "player",
            "map",
            "levelConfig"
        ])

        if (player && map) {
            const playerTile = {
                c: player.ps.x / map.tsize,
                r: player.ps.y / map.tsize
            }
            player.currentTile = playerTile
            gameState.updateState((gameData) => ({
                ...gameData,
                map: {
                    ...gameData.map,
                    centerTile: playerTile
                }
            }))

            if (levelConfig) {
                if (tick > levelConfig.nextT) {
                    const nextT =
                        Math.floor(Math.random() * levelConfig.nextRand) +
                        levelConfig.nextMin
                    gameState.setState("levelConfig", { ...levelConfig, nextT })
                    gameState.setState(
                        "walls",
                        updateWalls(gameState, map, levelConfig)
                    )
                    gameState.setState("tick", 0)
                }
            }

            player = player.run(gameState, player)
            player.currentTiles = elementTiles(player, map)
            player.blk = calcblk(player.currentTiles, map)

            gameState.setState("player", player)
        }

        gameState.updateState((gameData) => ({
            ...gameData,
            entities: gameData.entities
                .map((element) => {
                    if (typeof element.run === "function") {
                        element = element.run(gameState, element)
                    }
                    if (element) {
                        element.currentTiles = elementTiles(element, map)
                        element.blk = calcblk(element.currentTiles, map)
                    }

                    return element
                })
                .filter((element) => !!element)
        }))

        const elems = [
            ...(gameState.getState("entities") || []),
            gameState.getState("player")
        ]
            .filter((e) => !!e && e.currentTiles)
            .map((e) => {
                e.tilesIds = e.currentTiles.map((t) => "c" + t.c + "r" + t.r)
                return e
            })
            .filter((e) => e.collide)

        for (const subj of elems) {
            for (const el of elems) {
                if (
                    subj.id !== el.id &&
                    subj.tilesIds.some((t) => el.tilesIds.indexOf(t) >= 0)
                ) {
                    if (typeof subj.onCollide === "function") {
                        subj.onCollide(gameState, subj, el)
                    }
                }
            }
        }
    }

    gameState.setState("lastTime", now)
    setTimeout(() => gameLoop(gameState), loopSpeed)
}

export function renderLoop(gameState) {
    const renderFps = (msg, pos) =>
        renderText(gameState, msg, pos, "lime", genFont({ size: "10px" }))
    const {
        ctx,
        canvas,
        map,
        player,
        levelConfig,
        tick
    } = gameState.gbk([
        "ctx",
        "canvas",
        "map",
        "player",
        "levelConfig",
        "tick"
    ])
    const status = gameState.gameStatus()
    // TODO refactor
    const classStatus = `status-${status}`
    d4(canvas, "status-init")
    d4(canvas, "status-play")
    d4(canvas, "status-paused")
    d4(canvas, "status-gameover")
    d4(canvas, "status-died")
    d3(canvas, classStatus)

    const lastTime = gameState.getState("lastTimeRender", +new Date())

    const now = +new Date()
    const deltaTime = now - lastTime
    const actualFps = Math.round(1000 / deltaTime)

    gameState.setState("actualFpsRender", actualFps)

    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        resetBlur(ctx)
        // draw Map
        const status = gameState.gameStatus()
        if (status === "play") {
            if (map && map.centerTile && player) {
                const playerTile = map.centerTile

                const canvasCenter = {
                    x: canvas.width / 2,
                    y: canvas.height / 2
                }
                const mapCenter = {
                    x: ((map.cols * playerTile.c) / map.cols) * map.tsize,
                    y: ((map.rows * playerTile.r) / map.rows) * map.tsize
                }

                const pov = {
                    x: canvasCenter.x - mapCenter.x,
                    y: canvasCenter.y - mapCenter.y
                }
                gameState.updateState((gameData) => ({
                    ...gameData,
                    map: { ...gameData.map, pov }
                }))

                if (levelConfig) {
                    const animDuration = 50
                    const step = tick - levelConfig.nextT + animDuration

                    if (step >= 0) {
                        ctx.beginPath()

                        ctx.rect(0, 0, canvas.width, canvas.height)
                        ctx.fillStyle = `rgba(255,255,255, ${
                            step / animDuration
                        })`
                        ctx.fill()
                    }
                }

                renderTiles(gameState)
                // RENDER maze stack for debug

                if (player && typeof player.render === "function") {
                    player.render(gameState, player)
                }
                const { startCol, endCol, startRow, endRow } = getTilesInView(
                    map
                )
                const entities = gameState.getState("entities", [])

                entities.forEach((element) => {
                    if (typeof element.render === "function" && element.ps) {
                        const col = Math.round(element.ps.x / map.tsize)
                        const row = Math.round(element.ps.y / map.tsize)
                        if (
                            (col >= startCol && col <= endCol) ||
                            (row >= startRow && row <= endRow)
                        ) {
                            element.render(gameState, element, {
                                x: element.ps.x + pov.x,
                                y: element.ps.y + pov.y
                            })
                        }
                    }
                })

                renderArrows(gameState)
            }
        }

        if (status !== "loading") {
            const {menus, ctrls} = gameState.gbk(["menus", "ctrls"])
        
            // Render menus
            for (const menuName in menus) {
                if (menus.hasOwnProperty(menuName)) {
                    const menu = menus[menuName]
                    if (typeof menu.render === "function") {
                        menu.render(gameState)
                    }
                }
            }
            for (const ctrlName in ctrls) {
                if (ctrls.hasOwnProperty(ctrlName)) {
                    const ctrl = ctrls[ctrlName]
                    if (typeof ctrl.render === "function") {
                        ctrl.render(gameState)
                    }
                }
            }

            if (gameState.gameStatus() === "play") renderHUD(gameState)

            renderFps(`${gameState.getState("actualFps")} FPS`, {
                x: 30,
                y: canvas.height -50
            })
            renderFps(`${gameState.getState("actualFpsRender")} FPSR`, {
                x: 30,
                y: canvas.height -35
            })

            if (player.currentTile) {
                renderFps(
                    `c: ${player.currentTile.c}, r: ${player.currentTile.r}`,
                    {
                        x: 30,
                        y: canvas.height -20
                    }
                )
            }
        }
    }
    gameState.setState("lastTimeRender", now)

    window.requestAnimationFrame(() => renderLoop(gameState))
}
