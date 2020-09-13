
const level0 = {
    cols: 50,
    rows: 50,
    entities: {
        404: { n: 1 },
        401: [
            { n: 1, speed: 2, updatePathEvery: 10, maxDist: 200, maxPath: 200 }
        ],
        auth: { n: 1 },
        exit: { n: 1 }
    }
}
const level1 = {
    cols: 50,
    rows: 50,
    entities: {
        404: { n: 2 },
        401: [
            { n: 1, speed: 2, updatePathEvery: 10, maxDist: 400, maxPath: 400 }
        ],
        auth: { n: 1 },
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

const oth = []
for (let i = 0; i < 100; i++) {
    
    const diffMaj = Math.floor(i / 10);

    let s = 50

    if (diffMaj<3) {
        s = 100
    } else  if (diffMaj<7){
        s=150
    } else {
        s= 200
    }
    let e401 = Math.ceil(Math.ceil(i / 10)) 
    if (i>20) e401 += Math.floor(Math.random() * 2)
    else if (i>40) e401 += Math.floor(Math.random() * 2) + 2
    else if (i>100) e401 += Math.floor(Math.random() * 3) + 5


    const lev = {
        cols: s,
        rows: s,
        entities: {
            404: { n: Math.ceil(Math.ceil(i / 10) / 2) },
            exit: { n: 1 },
            401: [],
            auth: { n: Math.floor(Math.random() * 3) + 3 }
        }
    }

    for (let j = 0; j < e401; j++) {
        const element = {
            n: 1,
            speed: Math.min(5, Math.max(2, j)),
            updatePathEvery: 15,
            maxDist: 400,
            maxPath: 200 + (j*75)
        }

        lev.entities["401"].push(element)
        
    }
    oth.push(lev)
}
export const levels = [...oth]
