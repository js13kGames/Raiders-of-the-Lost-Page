import createMenu from "./menus.js";
import { domElement, hide, show } from "./domUtils.js";
import { playSound } from "./audio.js";

export function initMainMenu(gameState, startFn) {
  const mainMenu = createMenu(gameState, (menu, gameState) => {
    const menuContainer = domElement("#main-menu-container");
    const startBtn = domElement("#main-manu-start");

    const continueBtn = domElement("#main-manu-continue");
    const playButton = domElement("#main-manu-sound");
    startBtn.addEventListener("click", (evt) => {
      evt.preventDefault();
      startFn(gameState);
    });

    continueBtn.addEventListener("click", (evt) => {
      evt.preventDefault();
      gameState.updateGameStatus("play");
    });

    playButton.addEventListener("click", (evt) => {
      evt.preventDefault();

      const waveNote = (note) => ({ ...note, oscillator: "triangle" });

      const sectOctave = (note) => `${note}3`;
      playSound(gameState, waveNote({ note: sectOctave("G"), duration: 0.3 }))
        .then(() =>
          playSound(gameState, waveNote({ note: null, duration: 0.3 }))
        )
        .then(() =>
          playSound(
            gameState,
            waveNote({ note: sectOctave("G"), duration: 0.3 })
          )
        )
        .then(() =>
          playSound(gameState, waveNote({ note: null, duration: 0.3 }))
        )
        .then(() =>
          playSound(
            gameState,
            waveNote({ note: sectOctave("G"), duration: 0.3 })
          )
        )
        .then(() =>
          playSound(gameState, waveNote({ note: null, duration: 0.3 }))
        )
        .then(() =>
          playSound(
            gameState,
            waveNote({ note: sectOctave("D#"), duration: 0.4 })
          )
        )
        .then(() =>
          playSound(gameState, waveNote({ note: null, duration: 0.05 }))
        )
        .then(() =>
          playSound(
            gameState,
            waveNote({ note: sectOctave("A#"), duration: 0.2 })
          )
        )
        .then(() =>
          playSound(gameState, waveNote({ note: null, duration: 0.05 }))
        )
        .then(() =>
          playSound(
            gameState,
            waveNote({ note: sectOctave("G"), duration: 0.2 })
          )
        )
        .then(() =>
          playSound(gameState, waveNote({ note: null, duration: 0.3 }))
        )
        .then(() =>
          playSound(
            gameState,
            waveNote({ note: sectOctave("D#"), duration: 0.4 })
          )
        )
        .then(() =>
          playSound(gameState, waveNote({ note: null, duration: 0.05 }))
        )
        .then(() =>
          playSound(
            gameState,
            waveNote({ note: sectOctave("A#"), duration: 0.2 })
          )
        )
        .then(() =>
          playSound(gameState, waveNote({ note: null, duration: 0.05 }))
        )
        .then(() =>
          playSound(
            gameState,
            waveNote({ note: sectOctave("G"), duration: 0.2 })
          )
        );
    });

    const m = {
      render: (gameState) => {
        if (!!gameState.getState("demo")) {
          show(continueBtn);
        } else {
          hide(continueBtn);
        }
        if (gameState.gameStatus() === "play") {
          hide(menuContainer);
        } else {
          show(menuContainer);
        }
      },
    };
    return { ...menu, ...m };
  });

  return mainMenu;
}

export function initPauseMenu(gameState) {
  const pauseMenu = createMenu(gameState, (menu, gameState) => {
    const button = domElement("#play-pause-btn");
    const element = domElement("#pause-menu-container");
    const menuInit = {
      show: () => show(element),
      hide: () => hide(element),
      element: element,
      button: button,
      render: (gameState) => {
        // Dynamic menu position
        const canvas = gameState.getState("canvas");
        element.style.position = "absolute";

        element.style.top = `${canvas.height - 50}px`;
        element.style.left = `${canvas.width - 100}px`;
        if (gameState.gameStatus() === "play") {
          show(element);
        } else {
          hide(element);
        }
      },
    };

    button.addEventListener("click", (evt) => {
      evt.preventDefault();
      if (gameState.gameStatus() === "paused") {
        gameState.updateGameStatus("play");
      } else {
        gameState.updateGameStatus("paused");
      }
    });
    return { ...menu, ...menuInit };
  });
  return pauseMenu;
}
