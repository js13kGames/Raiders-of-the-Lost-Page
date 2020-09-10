const level0 = {
    cols: 50,
    rows: 50,
    entities: {
        404: { n: 3 },
        403: { n: 0, speed: 1 },
        401: { n: 0 },
        auth: { n: 0 },
        exit: { n: 1 },
    },
}
const level1 = {
  cols: 90,
  rows: 90,
  entities: {
      404: { n: 1 },
      403: { n: 0 },
      401: { n: 1, speed: 2 },
      auth: { n: 0 },
      exit: { n: 1 },
  },
}
const level2 = {
    cols: 100,
    rows: 100,
    entities: {
        404: { n: 10 },
        403: { n: 5, speed: 2 },
        401: { n: 5, speed: 2 },
        auth: { n: 2 },
        exit: { n: 1 },
    },
  }


export const levels = [
   level0, level1, level2
]
