export function partial(fn, p) {
  return (...rest) => fn(p, ...rest);
}

export function compose(...restFns) {
  return (...rest) =>
    restFns.reduce((v, fn) => {
      return fn(v);
    }, ...rest);
}
