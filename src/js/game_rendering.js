import { findPoint2Angle, toRadiant } from "./utils.js"
import { mapTileInView, tilePosition, isBorder, pntBtw2Pnts } from "./map.js"

function circleWithSlashes(ctx, center, r, slashes = []) {
    ctx.arc(center.x, center.y, r, 0, 2 * Math.PI)
    slashes.forEach((s) => {
        const start = findPoint2Angle(s[0], center, r)
        ctx.moveTo(start.x, start.y)
        const end = findPoint2Angle(s[1], center, r)
        ctx.lineTo(end.x, end.y)
    })
}

export function render403(gameState, element, relPos) {
    const { ctx, map } = gameState.getByKeys(["ctx", "map"])
    const r = element.r

    ctx.beginPath()

    circleWithSlashes(ctx, relPos, r, [
        [225, 45],
        [315, 135],
    ])
    ctx.strokeStyle = "red"
    ctx.lineWidth = 3.5
    ctx.stroke()
    ctx.beginPath()

    ctx.rect(relPos.x - r - 2, relPos.y + r / 2, 25, 13)
    ctx.fillStyle = "rgba(255,0,0,0.8)"
    ctx.fill()
    ctx.beginPath()

    ctx.font = "12px serif"
    ctx.fillStyle = "white"
    ctx.fillText(element.type, relPos.x - r + 1, relPos.y + r + 6)

    ctx.beginPath()

    element.path = element.path || []

    element.path.forEach((t) => {
        ctx.rect(
            t.coord[0] * map.tsize + map.pov.x,
            t.coord[1] * map.tsize + map.pov.y,
            map.tsize,
            map.tsize
        )
    })

    ctx.fillStyle = "pink"
    ctx.fill()
}

export function render401(gameState, element, relPos) {
    const { ctx } = gameState.getByKeys(["ctx", "player"])

    const r = element.r

    ctx.beginPath()

    circleWithSlashes(ctx, relPos, r, [[225, 45]])
    if (!element.disabled) {
        ctx.strokeStyle = "red"
    } else {
        ctx.strokeStyle = "rgba(100,100,200,0.6)"
    }
    ctx.lineWidth = 3.5

    ctx.stroke()
    ctx.beginPath()

    ctx.rect(relPos.x - r - 2, relPos.y + r / 2, 25, 13)
    ctx.fillStyle = "rgba(255,0,0,0.8)"
    ctx.fill()
    ctx.beginPath()

    ctx.font = "12px serif"
    ctx.fillStyle = "white"
    ctx.fillText(element.type, relPos.x - r + 1, relPos.y + r + 6)
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
    const { ctx, map, ghost, levelConfig } = gameState.getByKeys([
        "ctx",
        "map",
        "ghost",
        "levelConfig",
    ])
    const { pov } = map
    ctx.font = "10px Verdana"
    const borders = []
    ctx.beginPath()
    if (levelConfig) {
        ctx.fillStyle = `rgba(0,250,0,1)`
    } else {
        ctx.fillStyle = `rgba(0,0,0,${ghost ? "0.5" : "1"})`
    }

    mapTileInView(map, (c, r, cols) => {
        const tile = map.getTile(c, r)
        const { x, y } = tilePosition(c, r, map.tsize, pov)
        if (isBorder(c, r, map.cols, map.rows)) {
            borders.push([c, r])// check that
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
            case "403":
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
