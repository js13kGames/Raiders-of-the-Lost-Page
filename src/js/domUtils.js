export function domElement(selector, parent = document) {
  return parent.querySelector(selector);
}
export function hide(el) {
  el.style.display = "none";
}

export function show(el) {
  el.style.display = "block";
}
export const appendElement = (element, parent = document.body) => parent.appendChild(element);

export const viewportDims = () => ({
  w: document.documentElement.clientWidth || 600,
  h: document.documentElement.clientHeight || 800,
});

export const setStageDim = (stage, dims = { w: 800, h: 600 }) => {
  stage.width = dims.w;
  stage.height = dims.h;
  return stage;
};
