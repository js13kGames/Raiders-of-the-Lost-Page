export function domElement(selector, parent = document) {
    return parent.querySelector(selector)
}
export function hide(el) {
    if (!el) return false
    el.style.display = "none"
}

export function hasClass(el, className) {
    if (!el) return false
    return el.classList
        ? el.classList.contains(className)
        : new RegExp("\\b" + className + "\\b").test(el.className)
}

export function addClass(el, className) {
    if (!el) return false
    if (el.classList) el.classList.add(className)
    else if (!hasClass(el, className)) el.className += " " + className
}

export function removeClass(el, className) {
    if (!el) return false
    if (el.classList) el.classList.remove(className)
    else
        el.className = el.className.replace(
            new RegExp("\\b" + className + "\\b", "g"),
            ""
        )
}

export function show(el, display = "block") {
    if (!el) return false
    el.style.display = display
}
export function appendElement(element, parent = document.body) {
    return parent.appendChild(element)
}

export function viewportDims() {
    return [document.documentElement.clientWidth-50, document.documentElement.clientHeight- 50]
}

export function setStageDim(stage, container, w = 800, h = 600) {
    container.style.width = `${w}px`
    container.style.height = `${h}px`
    stage.width = w
    stage.height = h
    return stage
}
