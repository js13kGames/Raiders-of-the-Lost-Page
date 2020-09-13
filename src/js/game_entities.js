import createEntity from "./entities.js"
import { dstBtw2Pnts, pntBtw2Pnts, findPath, tileps } from "./map.js"
import { easeInOutCubic } from "./rendering.js"
import {
    render401,
    render404,
    renderExit,
    renderAuth
} from "./game_rendering.js"
import { pickExit } from "./game_audio.js"

const goTo = (gameState, element) => {
    const { map, player } = gameState.gbk(["map", "player"]),
        { ps, updatePathEvery, updatePath, maxPath, maxDist } = element,
        { auth = false } = player.equip || {}

    if (auth || player.ghost || dstBtw2Pnts(player.ps, ps) > maxDist) {
        element.path = []
        element.updatePath = updatePathEvery + 1

        return element
    }
    if (updatePath > updatePathEvery) {
        element.path = findPath(
            [
                Math.floor(element.ps.x / map.tsize),
                Math.floor(element.ps.y / map.tsize)
            ],
            [
                Math.floor(player.currentTile.c),
                Math.floor(player.currentTile.r)
            ],
            map,
            maxPath
        )
        element.updatePath = 0
    } else {
        element.updatePath++
    }

    const newStp = element.path && element.path[0]

    if (newStp) {
        const nextPos = pntBtw2Pnts(
            ps,
            tileps(newStp.coord[0], newStp.coord[1], map.tsize, { x: 0, y: 0 }),
            element.speed
        )

        element.ps = nextPos
        const nextTile = tileps(newStp.coord[0], newStp.coord[1], map.tsize, {
            x: 0,
            y: 0
        })
        if (
            Math.abs(Math.floor(nextPos.x) - nextTile.x) < 5 &&
            Math.abs(Math.floor(nextPos.y) - nextTile.y) < 5
        ) {
            element.path.splice(0, 1)
        }
    }

    return element
}
function movingEntitity(
    start,
    steps,
    speed,
    updatePathEvery = 20,
    maxDist = 400,
    maxPath = 200
) {
    return {
        start: { ...start },
        steps: [...steps],
        step: 0,
        ps: { ...start },
        speed,
        easingSpeed: 150,
        easingFunc: easeInOutCubic,
        lastVisited: 0,
        easingTicks: 0,
        direction: 0,
        blk: { t: false, r: false, b: false, l: false },
        updatePath: Math.floor(Math.random() * 10),
        updatePathEvery,
        maxDist,
        maxPath,
        run: goTo
    }
}

function createEnemyEntity(baseData) {
    const {
        ps,
        speed = 4,
        steps = [],
        updatePathEvery = 20,
        maxDist = 400,
        maxPath = 200
    } = baseData
    return createEntity({
        ...movingEntitity(ps, steps, speed, updatePathEvery, maxDist, maxPath),
        r: 10,
        enemy: true,
        collide: true
    })
}

export function create401Entity(baseData) {
    const baseEntity = createEnemyEntity(baseData)
    return {
        ...baseEntity,
        disabled: false,
        run: (gameState, element) => {
            const { player } = gameState.gbk(["player"])
            const { auth = false } = player.equip || {}
            if (auth) {
                element.disabled = true
                element.collide = false
            } else {
                element.disabled = false
                element.collide = true
            }

            return baseEntity.run(gameState, element)
        },
        type: "401",
        render: render401
    }
}
export function create404Entity(baseData) {
    const { ps } = baseData
    const entity = createEntity({
        ps,
        fileType: (() => {
            const types = ["js", "html", "css"]
            return types[Math.round(Math.random() * (types.length - 1))]
        })(),
        type: "404",
        r: 10,
        collide: true,
        render: render404
    })

    return entity
}

export function createExitEntity(baseData) {
    return createEntity({
        ...baseData,
        type: "exit",
        opened: false,
        collide: false,
        r: 10,
        render: renderExit,
        onCollide: (gameState, entity, oth) => {
            if (oth.player && entity.opened) {
                const { newLevel } = gameState.gbk(["newLevel"])
                pickExit(gameState)
                newLevel(gameState)
            }
        },
        run: (gameState, entity) => {
            const f0f = gameState
                .getState("entities", [])
                .some((e) => e.type === "404")

            if (!f0f) {
                entity.opened = true
                entity.collide = true
            }
            return entity
        }
    })
}

export function createAuthEntity(baseData) {
    return createEntity({
        ...baseData,
        type: "auth",
        onCollide: () => true,
        collide: true,
        r: 6,
        ttl: 5,
        onCollect: (element) => ({
            auth: {
                pickedOn: +new Date(),
                ttl: element.ttl * 1000,
                rem: element.ttl * 1000,
                authenticated: true,
                run: (eq) => {
                    const passed = +new Date() - eq.pickedOn
                    const rem = eq.ttl - passed
                    if (rem <= 0) {
                        return null
                    }
                    return { ...eq, rem: eq.ttl - passed }
                }
            }
        }),
        render: renderAuth,
        run: (gameState, entity) => {
            const f0f = gameState
                .getState("entities", [])
                .some((e) => e.type === "404")

            if (!f0f) entity.opened = true
            return entity
        }
    })
}
