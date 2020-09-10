export function domElement(selector, parent = document) {
  return parent.querySelector(selector);
}
export function hide(el) {
  if (!el) return false;
  el.style.display = "none";
}

export function hasClass(el, className) {
  if (!el) return false;
  return el.classList ? el.classList.contains(className) : new RegExp("\\b" + className + "\\b").test(el.className);
}

export function addClass(el, className) {
  if (!el) return false;
  if (el.classList) el.classList.add(className);
  else if (!hasClass(el, className)) el.className += " " + className;
}

export function removeClass(el, className) {
  if (!el) return false;
  if (el.classList) el.classList.remove(className);
  else el.className = el.className.replace(new RegExp("\\b" + className + "\\b", "g"), "");
}

export function show(el) {
  if (!el) return false;
  el.style.display = "block";
}
export const appendElement = (element, parent = document.body) => parent.appendChild(element);

export const viewportDims = () => ({
  w: document.documentElement.clientWidth || 600,
  h: document.documentElement.clientHeight || 800,
});

export const setStageDim = (stage,  w= 800, h= 600 ) => {
  stage.width = w;
  stage.height = h;
  return stage;
};
