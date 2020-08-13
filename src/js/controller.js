export default function createController(initCtrl = {}) {
  const ctrl = {};

  return { ...ctrl, ...initCtrl };
}

export function addEventListener(gameState, ctrl, eventName, evtFunction) {
  gameState.updateState((state) => {
    const regEvts = state.evts || {};

    removeEventListener(eventName, gameState);
    const newEvt = {};
    newEvt[eventName] = (evt) => evtFunction(evt, ctrl, gameState);
    document.addEventListener(eventName, newEvt[eventName]);
    return { ...state, evts: { ...regEvts, ...newEvt } };
  });
}

export function removeEventListener(eventName, gameState) {
  gameState.updateState((state) => {
    const regEvts = state.evts || {};
    if (regEvts[eventName] && typeof regEvts[eventName] === "function") {
      document.removeEventListener(eventName, regEvts[eventName]);
      delete regEvts[eventName];
    }
    return { ...state, evts: { ...regEvts } };
  });
}
