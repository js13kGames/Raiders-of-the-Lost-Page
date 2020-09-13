import { reverseDirs } from "./utils.js"

export function isBorder(c, r, cols, rows) {
    return c === 0 || r === 0 || r === rows - 1 || c === cols - 1
}
export function getTilesInView(map) {
    if (!map.centerTile) return {}
    return {
        startCol: Math.max(0, Math.round(map.centerTile.c - map.viewCols / 2)),
        endCol: Math.min(
            map.cols,
            Math.round(map.centerTile.c + map.viewCols / 2)
        ),
        startRow: Math.max(0, Math.round(map.centerTile.r - map.viewRows / 2)),
        endRow: Math.min(
            map.rows,
            Math.round(map.centerTile.r + map.viewRows / 2)
        )
    }
}
export function mapTileInView(map, mapFn) {
    // to improve
    const { startCol, endCol, startRow, endRow } = getTilesInView(map)
    for (var r = startRow; r < endRow; r++) {
        for (var c = startCol; c < endCol; c++) {
            mapFn(c, r, { startRow, endRow, startCol, endCol })
        }
    }
}

export function tileps(c, r, tsize, pov) {
    return {
        x: c * tsize + pov.x,
        y: r * tsize + pov.y
    }
}
export function borders(pos, f, map, val, bord = [0, 1, 2, 3]) {
    if (!bord.length) return

    const st = 0
    const end = f
    for (let i = st; i < end; i++) {
        for (let j = st; j < end; j++) {
            let ok = false

            if (bord.indexOf(0) >= 0 && j <= 0) ok = true
            else if (bord.indexOf(1) >= 0 && i >= f - 1) ok = true
            else if (bord.indexOf(2) >= 0 && j >= f - 1) ok = true
            else if (bord.indexOf(3) >= 0 && i <= 0) ok = true

            const c = pos[0] * f + i
            const r = pos[1] * f + j
            if (!isBorder(c, r, map.cols, map.rows) && ok) {
                map.setTile(c, r, val)
            }
        }
    }
}

export function mazeBorders(map, path, f) {
    for (const key in path) {
        if (path.hasOwnProperty(key)) {
            const [x, y] = key.split("-").map((e) => parseFloat(e, 10))
            const bs = path[key]

            const bords = reverseDirs(bs)
            borders([x, y], f, map, 0, bs)
            borders([x, y], f, map, 1, bords)
        }
    }
}

export function clearCenterMap(map, c, w = 10) {
    for (let i = -w; i < w; i++) {
        for (let j = -w; j < w; j++) {
            map.setTile(c[0] + i, c[1] + j, 0)
        }
    }
}

export function pxXSecond(map, tXs) {
    return tXs * map.tsize
}
export function generateMap(width, height, tsize = 4) {
    let tiles = []

    const cols = width
    const rows = height
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (isBorder(c, r, cols, rows)) {
                tiles.push(1)
            } else {
                tiles.push(0)
            }
        }
    }

    const map = {
        cols,
        rows,
        tsize,
        tiles,
        centerTile: { c: Math.round(cols / 2), r: Math.round(rows / 2) },
        getTile: (col, row) => map.tiles[row * map.cols + col],
        setTile: (col, row, val) => (map.tiles[row * map.cols + col] = val),
        renderTile: () => null,
        tCoords: () => tiles.map((_, i) => [Math.floor(i / cols), i % rows])
    }

    return map
}

export function setVOF(map, width, height) {
    if (!map) {
        console.error("Map is null")
        return
    }
    const visibleWidth = Math.ceil(width / map.tsize)
    const visibleHeight = Math.ceil(height / map.tsize)
    const viewCols = visibleWidth
    const viewRows = visibleHeight

    const camera = {
        viewCols: viewCols,
        viewRows: viewRows
    }

    return { ...map, ...camera }
}
/**
 * Return the distance between two points
 *
 * @param {x,y} p1 Point 1
 * @param {x,y} p2 Point 2
 */
export function dstBtw2Pnts(p1, p2) {
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y
    return Math.sqrt(dx * dx + dy * dy)
}
/**
 * Returns the point between 2 other points at a given distance
 *
 * @param {x,y} p1 Point 1
 * @param {x,y} p2 Point 2
 */
export function pntBtw2Pnts(p1, p2, dist) {
    const ptsDist = dstBtw2Pnts(p1, p2)
    if (ptsDist < dist) {
        return { ...p2 }
    }
    const distRatio = ptsDist ? dist / ptsDist : 0
    return {
        x: p1.x + distRatio * (p2.x - p1.x),
        y: p1.y + distRatio * (p2.y - p1.y)
    }
}
export function isCenterBlock(c, r, map) {
    return c % (map.sf / 2) === 0 && r % (map.sf / 2) === 0
}

export function surrounding(map, center, range) {
    const pos = []
    for (let c = -range; c < range; c++) {
        for (let r = -range; r < range; r++) {
            const [cc, cr] = center
            if (cc >= 0 && cc < map.cols && cr >= 0 && cr < map.rows)
                pos.push([cc + c, cr + r])
        }
    }
    return pos
}

export function nearTiles(pos, visited, maxCol, maxRow) {
    const tiles = [
        [pos[0], pos[1] - 1],
        [pos[0] + 1, pos[1]],
        [pos[0], pos[1] + 1],
        [pos[0] - 1, pos[1]]
    ]

    return tiles.filter((t) => {
        return (
            t[0] >= 0 &&
            t[0] < maxCol &&
            t[1] >= 0 &&
            t[1] < maxRow &&
            !visited[`${t[0]}-${t[1]}`]
        )
    })
}
export function relPos(p1, p2) {
    if (p1[1] - 1 === p2[1]) return 0
    else if (p1[0] + 1 === p2[0]) return 1
    else if (p1[1] + 1 === p2[1]) return 2
    else if (p1[0] - 1 === p2[0]) return 3
    else return false
}

export function calcRoute(start, end, map) {
    const stack = []
    const visited = {}
    let step = 0
    const maxStep = 10000
    let pos = start

    while (`${pos[0]}-${pos[1]}` !== `${end[0]}-${end[1]}` && step < maxStep) {
        visited[`${pos[0]}-${pos[1]}`] = true
        const near = nearTiles(pos, visited, map.cols, map.rows)
            .filter(([c, r]) => {
                return !map.getTile(c, r)
            })
            .sort((a, b) => {
                return dstBtw2Pnts(
                    { x: end[0], y: end[1] },
                    { x: a[0], y: a[1] }
                ) < dstBtw2Pnts({ x: end[0], y: end[1] }, { x: b[0], y: b[1] })
                    ? 1
                    : -1
            })

        if (near.length > 0) {
            const rand = Math.floor(Math.random() * near.length)
            const next = near[rand]

            stack.push(pos)
            pos = next

            step++
        } else {
            stack.pop()
            pos = stack[stack.length - 1]
        }

        if (typeof pos === "undefined") {
            return false
        }
    }

    return true
}

function retracePath(arrive) {
    let n = arrive
    const path = []
    while (n.parent) {
        path.push(n)
        n = n.parent
    }

    return path.reverse()
}

export function findPath(p1, p2, map, stepMax = 200) {
    const nodes = map.tCoords().reduce((acc, [a, b]) => {
        const l = `${a}-${b}`
        acc[l] = {
            label: l,
            coord: [a, b],
            parent: null,
            local: Infinity,
            global: Infinity
        }
        return acc
    }, {})

    const arrive = nodes[`${p2[0]}-${p2[1]}`]
    if (!arrive) {
        return
    }
    const visited = {}
    const eur = (a, b) =>
        dstBtw2Pnts({ x: a[0], y: a[1] }, { x: b[0], y: b[1] })
    const byGlob = (a, b) => (a.global > b.global ? 1 : -1)
    let current = nodes[`${p1[0]}-${p1[1]}`]
    current.global = eur(p1, p2)
    current.local = 0
    let toTest = [current]

    let inc = 0

    while (current && inc < stepMax) {
        let near = nearTiles(
            [current.coord[0], current.coord[1]],
            visited,
            map.cols,
            map.rows
        ).filter(([a, b]) => map.getTile(a, b) === 0)

        near.forEach(([a, b]) => {
            const n = nodes[`${a}-${b}`]
            if (current.local + 1 < n.local) {
                n.parent = current
                n.local = current.local + 1
                n.global = n.local + eur(n.coord, p2)
            }
            if (!toTest.some((t) => t.label === n.label)) toTest.push(n)
        })

        visited[`${current.coord[0]}-${current.coord[1]}`] = true
        if (current.label === `${p2[0]}-${p2[1]}`) current = null
        else {
            toTest = toTest
                .filter((n) => n.label !== current.label)
                .sort(byGlob)
            current = toTest.splice(0, 1)[0]

            inc++
        }
    }

    if (arrive.parent) {
        return retracePath(arrive)
    } else {
        return []
    }
}
