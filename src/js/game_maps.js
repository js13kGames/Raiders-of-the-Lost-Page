const oth = []
for (let i = 0; i < 100; i++) {
    
    const diffMaj = Math.floor(i / 10);
    const diffMin = i % 10;
    let s = 50

    if (diffMaj<3) {
        s = 50
    } else  if (diffMaj<5){
        s=100
    } else if (diffMaj<8){
        s=100
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
            404: { n: Math.ceil(Math.ceil(i / 10) / 2)+diffMin },
            exit: { n: 1 },
            401: [],
            auth: { n: Math.floor(Math.random() * 5) + diffMin }
        }
    }

    for (let j = 0; j < e401; j++) {
        const element = {
            n: diffMin,
            speed: Math.min(5, Math.max(2, j)),
            updatePathEvery: 15,
            maxDist: 400,
            maxPath: 200 + (j*75)
        }

        lev.entities["401"].push({...element})

    }
    oth.push({...lev})
}
export const levels = [...oth]
