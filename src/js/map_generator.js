import {dstBtw2Pnts,isCenterBlock,surrounding,calcRoute,nearTiles,relPos,mazeBorders, clearCenterMap,} from "./map.js"

function scaleTiles(map, fact = 10) {
    return {
        ...map,
        cols: map.cols / fact,
        rows: map.rows / fact,
        tsize: map.tsize * fact,
    }
}

export function generateMaze(map, gameState) {
    const f = 10
    let scaledMap = { ...scaleTiles(map, f) }
    const stack = []
    const visited = {}
    const tilesNum = scaledMap.cols * scaledMap.rows

    let pos = [
        scaledMap.cols / 2 - map.tsize / f / 2,
        scaledMap.rows / 2 - map.tsize / f / 2,
    ]
    let step = 0

    let walls = []
    const mazestack = []
    let exit = false
    while (Object.keys(visited).length < tilesNum && !exit) {
        let cell = []
        if (stack.length > 0 ) {
            const last = stack[stack.length-1]
            const rPos = relPos(pos, last)
            const invPos =  (rPos + 2) %4
            if (rPos !== false) {
                visited[`${last[0]}-${last[1]}`].push(invPos)
                cell.push(rPos)
            }

        }
        if (!visited[`${pos[0]}-${pos[1]}`]) visited[`${pos[0]}-${pos[1]}`] = cell;
        const near = nearTiles(pos, visited, scaledMap.cols, scaledMap.rows)

        if (near.length > 0) {
            const rand = Math.floor(Math.random() * near.length)
            const next = near[rand]
            walls.push(pos)

            stack.push(pos)
            mazestack.push(pos)
            pos = next

            step++
        } else {
            stack.pop()
            pos = stack[stack.length - 1]
        }

        if (!pos) {
            exit = true
        }
    }
    const c = [map.cols / 2, map.rows / 2]
 
    mazeBorders(map, visited, f)
    clearCenterMap(map, c, 10)
    gameState.setState("mazepath", visited)
    gameState.setState("mazestack", mazestack)
    gameState.setState("originalMaze", true);

    
    return { ...map, scaleFactor: f }
}

const t2p = (t, tsize) => ({ x: t[0] * tsize, y: t[1] * tsize })

function addEntities(map, centers, num, entityFn) {
    const entities = []
    for (let i = 0; i < num; i++) {
        // choosen Random
        const idx = Math.floor(Math.random() * centers.length)
        const sel = centers.splice(idx, 1)[0]
        entities.push(entityFn(t2p(sel, map.tsize)))
        //entities.push(entityFn(t2p([50, 60], map.tsize)));
    }

    return entities
}

// Note: entities should be placed near to each other (guardians???)
export function generateEntities(gameState, map, config = {}) {
    const range = 1
    const minDist = 20
    const allPoss = map
        .tCoords()
        .filter(
            ([c, r]) =>
                !map.getTile(c, r) &&
                surrounding(map, [c, r], range).every(
                    ([cc, cr]) => map.getTile(cc, cr) === 0
                )
        )
    const originCenters = allPoss.filter(([c, r]) => isCenterBlock(c, r, map))

    const bestCenters = originCenters.filter(([c, r]) => {
        const p1 = { x: map.centerTile.c, y: map.centerTile.r }
        return dstBtw2Pnts(p1, { x: c, y: r }) > minDist
    })

    const eNum =
        config["404"].n +
        config["exit"].n +
        config["auth"].n +
        config["403"].n +
        config["401"].n

    const takeRandom = (list, num) => {
        const out = []
        for (let i = 0; i < num; i++) {
            const rand = Math.floor(Math.random() * list.length)
            out.push(list.splice(rand, 1))
        }
        return out
    }
    let centers = [...bestCenters]
    if (
        eNum > bestCenters.length &&
        eNum < bestCenters.length + originCenters.length
    ) {
        const toTake = eNum - bestCenters.length
        centers = [...centers, ...takeRandom(originCenters, toTake)]
    } else if (eNum > bestCenters.length + originCenters.length) {
        const toTake = eNum - (bestCenters.length + originCenters.length)
        centers = [...centers, ...originCenters, ...takeRandom(allPoss, toTake)]
    }

    // TODO check is
    const blocked = centers.filter(
        ([i, j]) => !calcRoute([i, j], [map.cols / 2, map.rows / 2], map)
    )

    gameState.updateState((stateData) => ({
        ...stateData,
        map: { ...stateData.map, centers, blocked },
    }))

    // TODO CHECK there are enough
    let entities = []

    entities = [
        ...entities,
        ...addEntities(map, centers, config["404"].n, (position) => {
            return { position, type: "404" }
        }),
    ]
    entities = [
        ...entities,
        ...addEntities(map, centers, config["exit"].n, (position) => {
            return { position, type: "exit" }
        }),
    ]
    entities = [
        ...entities,
        ...addEntities(map, centers, config["auth"].n, (position) => {
            return { position, type: "auth" }
        }),
    ]
    entities = [
        ...entities,
        ...addEntities(map, centers, config["403"].n, (position) => {
            return {
                position,
                type: "403",
                speed: config["403"].speed || 3,
            }
        }),
    ]
    entities = [
        ...entities,
        ...addEntities(map, centers, config["401"].n, (position) => {
            return {
                position,
                type: "401",
                speed: config["401"].speed || 3,
            }
        }),
    ]

    return entities
}
