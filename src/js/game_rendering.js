import { findPoint2Angle, partial } from "./utils.js"
import { mapTileInView, tilePosition, isBorder, pntBtw2Pnts } from "./map.js"
import { drawFile } from "./rendering.js"

function circleWithSlashes(ctx, center, r, slashes = []) {
    ctx.arc(center.x, center.y, r, 0, 2 * Math.PI)
    slashes.forEach((s) => {
        const start = findPoint2Angle(s[0], center, r)
        ctx.moveTo(start.x, start.y)
        const end = findPoint2Angle(s[1], center, r)
        ctx.lineTo(end.x, end.y)
    })
}

function drawEnemy(ctx, pos, r, disabled, text = "") {
    circleWithSlashes(ctx, pos, r, [[225, 45]])
    if (!disabled) {
        ctx.strokeStyle = "red"
    } else {
        ctx.strokeStyle = "rgba(100,100,200,0.6)"
    }
    ctx.lineWidth = 3.5

    ctx.stroke()
    ctx.beginPath()

    ctx.rect(pos.x - r - 2, pos.y + r / 2, 25, 13)
    ctx.fillStyle = "rgba(255,0,0,0.8)"
    ctx.fill()
    ctx.beginPath()

    ctx.font = "12px serif"
    ctx.fillStyle = "white"
    ctx.fillText(text, pos.x - r + 1, pos.y + r + 6)
}
function draw404(ctx, pos, r) {
    const fold = 5
    const w = r - 2
    const h = r
    ctx.beginPath()
    drawFile(ctx, { x: pos.x - w, y: pos.y - h }, w, h, fold)
    ctx.strokeStyle = "blue"
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.beginPath()

    ctx.rect(pos.x - w - 5, pos.y + h / 2 - 11, 25, 13)
    ctx.fillStyle = "rgba(0,0,0,0.8)"
    ctx.fill()
    ctx.font = "12px serif"
    ctx.fillStyle = "white"
    ctx.fillText("404", pos.x - w - 2, pos.y + h / 2)
}
export function render401(gameState, element, relPos) {
    const { ctx, player, map } = gameState.getByKeys(["ctx", "player", "map"]),
        r = element.r,
        isFollowing = element.path && element.path.length

    ctx.beginPath()

    drawEnemy(ctx, relPos, r, element.disabled, element.type)

    // RENDER the path
    element.path = element.path || []
    ctx.moveTo(relPos.x, relPos.y)
    element.path.forEach((t) => {
        ctx.lineTo(
            t.coord[0] * map.tsize + map.pov.x,
            t.coord[1] * map.tsize + map.pov.y
        )
    })

    ctx.strokeStyle = "pink"
    ctx.lineWidth = 0.5
    ctx.stroke()
}

export function renderBackground(ctx, canvas, map, pov) {
    ctx.lineWidth = 0.3
    ctx.beginPath()

    ctx.rect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "rgba(0,0,0, 0.4)"
    ctx.fill()
    ctx.beginPath()

    for (let r = 0; r < map.rows * map.tsize; r += 100) {
        for (let c = 0; c < map.cols * map.tsize; c += 100) {
            ctx.arc(c + pov.x, r + pov.y, 100, 0, 2 * Math.PI)
        }
    }
    ctx.strokeStyle = "purple"
    ctx.stroke()
}

export function renderTiles(gameState) {
    const { ctx, map, levelConfig } = gameState.getByKeys([
        "ctx",
        "map",
        "levelConfig",
    ])
    const { pov } = map
    ctx.font = "10px Verdana"
    const borders = []
    ctx.beginPath()
    if (levelConfig) {
        ctx.fillStyle = `rgba(0,250,0,1)`
    } else {
        ctx.fillStyle = `rgba(0,0,0,1"})`
    }

    mapTileInView(map, (c, r, cols) => {
        const tile = map.getTile(c, r)
        const { x, y } = tilePosition(c, r, map.tsize, pov)
        if (isBorder(c, r, map.cols, map.rows)) {
            borders.push([c, r]) // check that
        }
        if (tile > 0) {
            //ctx.fillText(1, x, y)
            ctx.rect(x, y, map.tsize, map.tsize)
        }

        // if (isCenterBlock(c, r, map)) {
        //   ctx.arc(x, y, 2, 0, 2 * Math.PI);
        // }
    })
    ctx.fill()
    ctx.beginPath()
    ctx.fillStyle = `rgba(200,0,0,1)`
    borders.forEach(([c, r]) => {
        const { x, y } = tilePosition(c, r, map.tsize, pov)
        ctx.rect(x, y, map.tsize, map.tsize)
    })
    ctx.fill()
}

export function renderArrows(gameState) {
    const { entities, player, ctx, map } = gameState.getByKeys([
        "entities",
        "player",
        "ctx",
        "map",
    ])
    const pov = map.pov
    entities.forEach((e) => {
        let draw = false

        switch (e.type) {
            case "404":
                ctx.fillStyle = "blue"
                draw = true
                break
            case "401":
                ctx.fillStyle = "red"
                draw = false

                break
            case "exit":
                if (e.opened) {
                    draw = true
                    ctx.fillStyle = "green"
                } else {
                    ctx.fillStyle = "orange"
                }

                break
        }
        if (draw) {
            const p1 = pntBtw2Pnts(player.position, e.position, 20)
            const p2 = pntBtw2Pnts(player.position, e.position, 50)
            ctx.beginPath()

            const p0 = findPoint2Angle(
                0,
                { x: p1.x + pov.x, y: p1.y + pov.y },
                5
            )
            const p3 = findPoint2Angle(
                108,
                { x: p1.x + pov.x, y: p1.y + pov.y },
                5
            )

            ctx.moveTo(p0.x, p0.y)

            ctx.lineTo(p2.x + pov.x, p2.y + pov.y)
            ctx.lineTo(p3.x, p3.y)
            ctx.lineTo(p0.x, p0.y)
            ctx.fill()
        }
    })

    ctx.fillStyle = "tomato"
}

export function render404(gameState, element, relPos) {
    const { ctx, map, canvas } = gameState.getByKeys(["ctx", "map", "canvas"])
    draw404(ctx, relPos, element.r)
}

function drawExit(ctx, pos, r, open) {
    ctx.beginPath()
    ctx.fillStyle = open ? "green" : "red"

    ctx.arc(pos.x, pos.y, r, 0, 2 * Math.PI)
    ctx.fill()
}

export function renderExit(gameState, element, relPos) {
    const { ctx } = gameState.getByKeys(["ctx", "map", "canvas"])

    drawExit(ctx, relPos, element.r, element.opened)
}

function drawAuth(ctx, pos, r) {
    ctx.beginPath();
    ctx.fillStyle = "pink";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 0.5;

    ctx.arc(pos.x, pos.y, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

export function renderAuth(gameState, element, relPos) {
    const { ctx } = gameState.getByKeys(["ctx", "map", "canvas"]);
    drawAuth(ctx,relPos,  element.r)
}
export function renderTutorialEnemy(canvas) {
    const ctx = canvas.getContext("2d")

    drawEnemy(
        ctx,
        { x: canvas.width / 2, y: canvas.height / 2 },
        10,
        false,
        "401"
    )
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
