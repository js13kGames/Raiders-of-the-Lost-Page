const level0 = {
    cols: 50,
    rows: 50,
    entities: {
        404: { n: 1 },
        401: [
            { n: 1, speed: 2, updatePathEvery: 10, maxDist: 200, maxPath: 400 }
        ],
        auth: { n: 1 },
        exit: { n: 1 }
    }
}
const level1 = {
    cols: 90,
    rows: 90,
    entities: {
        404: { n: 10 },
        401: [
            { n: 10, speed: 2, updatePathEvery: 20, maxDist: 400, maxPath: 800 }
        ],
        auth: { n: 0 },
        exit: { n: 1 }
    }
}
const level2 = {
    cols: 100,
    rows: 100,
    entities: {
        404: { n: 10 },
        401: [
            { n: 5, speed: 2, updatePathEvery: 20, maxDist: 400, maxPath: 800 }
        ],
        auth: { n: 2 },
        exit: { n: 1 }
    }
}

export const levels = [level0, level1, level2]
