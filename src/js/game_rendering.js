import { findPoint2Angle, angle2pts, rad2pts } from "./utils.js"
import { mapTileInView, tileps, isBorder, pntBtw2Pnts } from "./map.js"
import { drawFile } from "./rendering.js"

function pltToRgba(idx, a = 1) {
    const plt = [
        [253, 54, 202], // 0 pink
        [215, 51, 215], // 1 darkPink,
        [0, 213, 255], //2 lightblue
        [21, 2, 84], // 3 darkBlue
        [19, 232, 128], // 4 light green
        [16, 128, 115], // 5 dark green
        [242, 52, 101], // 6 red
        [218, 32, 0] // 7 dark red
    ]

    return `rgba(${plt[idx].join(",")}, ${a})`
}

function shCols(ctx, sc, sb = 0) {
    ctx.shadowColor = sc
    ctx.shadowBlur = sb
}

function fdSt(ctx, ss, fs) {
    ctx.strokeStyle = ss
    ctx.fillStyle = fs
}

function drawEnemy(ctx, pos, r, disabled, pt = null) {
    const shCol = ctx.shadowColor,
        shBlur = ctx.shadowBlur

    let angle = 0
    if (pt) {
        shCols(ctx, "rgb(255,0,0)", 20)
        angle = angle2pts([pos.x, pos.y], pt)
    }

    ctx.beginPath()
    ctx.arc(pos.x, pos.y, r / 2, 0, 2 * Math.PI)

    for (let a = angle, i = 0; a <= 360 + angle; a += 30, i++) {
        const start = findPoint2Angle(a, pos, r / 2)
        ctx.moveTo(start.x, start.y)

        const end = findPoint2Angle(a, pos, i % 3 === 0 ? r - 2 : r + 3)
        ctx.lineTo(end.x, end.y)
    }

    if (!disabled) {
        fdSt(ctx, pltToRgba(6, 1), pltToRgba(7, 0.8))
    } else {
        fdSt(ctx, pltToRgba(7, 0.5), pltToRgba(6, 0.2))
    }
    ctx.lineWidth = 1

    ctx.stroke()
    ctx.fill()

    shCols(ctx, shCol, shBlur)
}

function draw404(ctx, pos, r) {
    const fold = 5,
        w = r - 2,
        h = r,
        shCol = ctx.shadowColor,
        shBlur = ctx.shadowBlur

    ctx.shadowColor = pltToRgba(2, 1)
    ctx.shadowBlur = 20
    ctx.beginPath()
    drawFile(ctx, { x: pos.x - w, y: pos.y - h }, w, h, fold)
    ctx.strokeStyle = pltToRgba(3, 1)
    ctx.fillStyle = pltToRgba(2, 0.5)

    ctx.lineWidth = 1
    ctx.fill()
    ctx.stroke()

    shCols(ctx, shCol, shBlur)
}

export function render401(gameState, element, relPos) {
    const { ctx, map } = gameState.gbk(["ctx", "map"]),
        r = element.r
    element.path = element.path || []
    let direction = null

    if (element.path.length) {
        const last = element.path[0]
        direction = [
            last.coord[0] * map.tsize + map.pov.x,
            last.coord[1] * map.tsize + map.pov.y
        ]
    }

    drawEnemy(ctx, relPos, r, element.disabled, direction)
}

export function renderTiles(gameState) {
    const { ctx, map } = gameState.gbk(["ctx", "map", "levelConfig"]),
        { pov } = map,
        borders = [],
        shCol = ctx.shadowColor,
        shBlur = ctx.shadowBlur

    ctx.beginPath()
    ctx.fillStyle = pltToRgba(0, 0.3)
    ctx.strokeStyle = pltToRgba(1, 1)
    ctx.lineWidth = 0.4

    mapTileInView(map, (c, r) => {
        const tile = map.getTile(c, r)
        const { x, y } = tileps(c, r, map.tsize, pov)
        if (isBorder(c, r, map.cols, map.rows)) {
            borders.push([c, r]) // check that
        }
        if (tile > 0) {
            ctx.rect(x, y, map.tsize, map.tsize)
        }
    })
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()

    ctx.fillStyle = pltToRgba(0, 0.3)
    ctx.strokeStyle = pltToRgba(1, 1)
    borders.forEach(([c, r]) => {
        const { x, y } = tileps(c, r, map.tsize, pov)
        ctx.rect(x, y, map.tsize, map.tsize)
    })
    ctx.fill()
    ctx.stroke()
    shCols(ctx, shCol, shBlur)
}

export function renderArrows(gameState) {
    const { entities, player, ctx, map } = gameState.gbk([
            "entities",
            "player",
            "ctx",
            "map"
        ]),
        pov = map.pov,
        shCol = ctx.shadowColor,
        shBlur = ctx.shadowBlur
    entities.forEach((e) => {
        let draw = false
        ctx.beginPath()

        switch (e.type) {
            case "404":
                ctx.strokeStyle = pltToRgba(2, 0.2)
                ctx.fillStyle = pltToRgba(2, 0.2)
                draw = true
                ctx.shadowColor = pltToRgba(2, 1)
                ctx.shadowBlur = 10
                break

            case "exit":
                if (e.opened) {
                    draw = true
                    ctx.strokeStyle = pltToRgba(4, 0.2)
                    ctx.fillStyle = pltToRgba(4, 0.2)
                    ctx.shadowColor = pltToRgba(4, 1)
                    ctx.shadowBlur = 10
                }

                break
        }
        if (draw) {
            const rad = rad2pts([e.ps.x, e.ps.y], [player.ps.x, player.ps.y])
            ctx.arc(
                player.ps.x + pov.x,
                player.ps.y + pov.y,
                21,
                rad - 0.4,
                rad + 0.4
            )
            const p0 = pntBtw2Pnts(player.ps, e.ps, 23)
            ctx.moveTo(p0.x + pov.x, p0.y + pov.y)

            const p2 = pntBtw2Pnts(player.ps, e.ps, 25)
            ctx.lineTo(p2.x + pov.x, p2.y + pov.y)

            ctx.lineWidth = 1
            ctx.stroke()
            ctx.fill()
        }
    })

    shCols(ctx, shCol, shBlur)
}

export function render404(gameState, element, relPos) {
    const { ctx } = gameState.gbk(["ctx"])
    draw404(ctx, relPos, element.r)
}

function drawExit(ctx, pos, r, open) {
    const shCol = ctx.shadowColor,
        shBlur = ctx.shadowBlur

    ctx.beginPath()
    if (open) {
        ctx.shadowColor = pltToRgba(4, 1)
        ctx.shadowBlur = 20
        ctx.strokeStyle = pltToRgba(4, 1)
        ctx.fillStyle = pltToRgba(5, 1)
    } else {
        ctx.strokeStyle = pltToRgba(4, 0.3)
        ctx.fillStyle = pltToRgba(5, 0.2)
    }
    ctx.lineWidth = 1

    ctx.arc(pos.x, pos.y, r, 2 * Math.PI, 0)
    ctx.stroke()
    ctx.fill()
    shCols(ctx, shCol, shBlur)
}

export function renderExit(gameState, element, relPos) {
    const { ctx } = gameState.gbk(["ctx", "map", "canvas"])

    drawExit(ctx, relPos, element.r, element.opened)
}

function drawAuth(ctx, pos, r) {
    const shCol = ctx.shadowColor,
        shBlur = ctx.shadowBlur
    ctx.shadowColor = pltToRgba(4, 0.6)
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.fillStyle = pltToRgba(4, 1)
    ctx.strokeStyle = pltToRgba(5, 1)
    ctx.lineWidth = 1

    ctx.arc(pos.x - r / 2, pos.y, r, 0, 1 * Math.PI)
    ctx.arc(pos.x + r / 2, pos.y, r, 0, 1 * Math.PI)
    ctx.arc(pos.x, pos.y, r - r / 2, 0, 1 * Math.PI)
    ctx.arc(pos.x, pos.y - r / 2, r, 0, 1 * Math.PI)

    ctx.fill()
    ctx.stroke()
    shCols(ctx, shCol, shBlur)
}

export function renderAuth(gameState, element, relPos) {
    const { ctx } = gameState.gbk(["ctx", "map", "canvas"])
    drawAuth(ctx, relPos, element.r)
}
export function renderTutorialEnemy(canvas) {
    const ctx = canvas.getContext("2d")

    drawEnemy(ctx, { x: canvas.width / 2, y: canvas.height / 2 }, 10, false)
}

export function renderTutorial404(canvas) {
    const ctx = canvas.getContext("2d")
    draw404(ctx, { x: canvas.width / 2, y: canvas.height / 2 }, 10)
}

function renderTutorialExit(open, canvas) {
    const ctx = canvas.getContext("2d")
    drawExit(ctx, { x: canvas.width / 2, y: canvas.height / 2 }, 10, open)
}

export function renderTutorialExitOpen(canvas) {
    renderTutorialExit(true, canvas)
}
export function renderTutorialExitClose(canvas) {
    renderTutorialExit(false, canvas)
}

export function renderTutorialAuth(canvas) {
    const ctx = canvas.getContext("2d")
    drawAuth(ctx, { x: canvas.width / 2, y: canvas.height / 2 }, 4)
}
function pinkRadiant(pos, ctx) {
    const liveColor = ctx.createRadialGradient(
        pos.x,
        pos.y,
        15,
        pos.x,
        pos.y,
        50
    )
    liveColor.addColorStop(0, pltToRgba(0, 1))
    liveColor.addColorStop(1, pltToRgba(1, 1))
    return liveColor
}
function renderLivesHUD(gameState) {
    const { canvas, ctx, player } = gameState.gbk(["canvas", "ctx", "player"])
    const lives = player.lives
    const fontSize = 20
    const font = `${fontSize}px sans-serif`

    ctx.font = font
    const metrics = ctx.measureText("\u{2764}")

    let livestr = []
    const charForLine = Math.floor((fontSize * 3) / metrics.width)

    for (let i = 0; i < lives; i++) {
        const rowIdx = Math.floor(i / charForLine)
        if (!livestr[rowIdx]) livestr[rowIdx] = ""
        livestr[rowIdx] += " \u{2764}"
    }
    const pos = { x: canvas.width - 100, y: 30 }
    ctx.font = font
    ctx.strokeStyle = pinkRadiant(pos, ctx)
    ctx.lineWidth = 2.5
    livestr.forEach((line, idx) => {
        ctx.strokeText(line, pos.x, pos.y + fontSize * idx)
    })
}

function renderCurrentLevelHUD(gameState) {
    const { currentLevel, ctx } = gameState.gbk(["currentLevel", "ctx"])
    const fontSize = 20
    const font = `${fontSize}px sans-serif`
    const levelstr = `Level: ${currentLevel + 1}`
    ctx.font = font
    const pos = { x: 30, y: 30 }

    ctx.fillStyle = pinkRadiant(pos, ctx)

    ctx.fillText(levelstr, pos.x, pos.y)
}

export function renderHUD(gameState) {
    const { canvas, ctx } = gameState.gbk(["currentLevel", "canvas", "ctx"])
    ctx.beginPath()
    ctx.rect(0, 0, canvas.width, 50)

    ctx.fillStyle = "rgba(0,0,0,0.9)"
    ctx.fill()

    renderLivesHUD(gameState)
    renderCurrentLevelHUD(gameState)
}
