export function partial(fn, p) {
  return (...rest) => fn(p, ...rest);
}

export function compose(...restFns) {
  return (...rest) =>
    restFns.reduce((v, fn) => {
      return fn(v);
    }, ...rest);
}

export function toRadiant(angle) {
  return (angle * Math.PI) / 180;
}
export function findPoint2Angle(angle, start, dist) {
  const rad = toRadiant(angle);
  return { x: start.x + dist * Math.sin(rad), y: start.y + dist * Math.cos(rad) };
}

export function reverseDirs (dirs) {
  return [0, 1, 2, 3].filter((b) => dirs.indexOf(b) < 0)
}