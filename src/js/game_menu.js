import createMenu from "./menus.js";
import { domElement, hide, show } from "./domUtils.js";
import { playSound } from "./audio.js";
function playImperialMarch(gameState) {
  const waveNote = (note) => ({ ...note, oscillator: "triangle" });

  const sectOctave = (note) => `${note}3`;
  playSound(gameState, waveNote({ note: sectOctave("G"), duration: 0.3 }))
    .then(() => playSound(gameState, waveNote({ note: null, duration: 0.3 })))
    .then(() => playSound(gameState, waveNote({ note: sectOctave("G"), duration: 0.3 })))
    .then(() => playSound(gameState, waveNote({ note: null, duration: 0.3 })))
    .then(() => playSound(gameState, waveNote({ note: sectOctave("G"), duration: 0.3 })))
    .then(() => playSound(gameState, waveNote({ note: null, duration: 0.3 })))
    .then(() => playSound(gameState, waveNote({ note: sectOctave("D#"), duration: 0.4 })))
    .then(() => playSound(gameState, waveNote({ note: null, duration: 0.05 })))
    .then(() => playSound(gameState, waveNote({ note: sectOctave("A#"), duration: 0.2 })))
    .then(() => playSound(gameState, waveNote({ note: null, duration: 0.05 })))
    .then(() => playSound(gameState, waveNote({ note: sectOctave("G"), duration: 0.2 })))
    .then(() => playSound(gameState, waveNote({ note: null, duration: 0.3 })))
    .then(() => playSound(gameState, waveNote({ note: sectOctave("D#"), duration: 0.4 })))
    .then(() => playSound(gameState, waveNote({ note: null, duration: 0.05 })))
    .then(() => playSound(gameState, waveNote({ note: sectOctave("A#"), duration: 0.2 })))
    .then(() => playSound(gameState, waveNote({ note: null, duration: 0.05 })))
    .then(() => playSound(gameState, waveNote({ note: sectOctave("G"), duration: 0.2 })));
}

export function initMainMenu(gameState, startFn, levelsFn) {
  const mainMenu = createMenu(gameState, (menu, gameState) => {
    const menuContainer = domElement("#main-menu-container");
    const startBtn = domElement("#main-manu-start");
    const continueBtn = domElement("#main-manu-continue");
    const playButton = domElement("#main-manu-sound");
    const congratulation = domElement("#congrats-screen");

    const { unlockedLevels } = gameState.getByKeys(["unlockedLevels"]);

    for (let i = 0; i <= unlockedLevels; i++) {
      const levelName = i + 1;
      const startLevel = levelsFn[i];
      if (typeof startLevel === "function") {
        const el = document.createElement("li");
        el.innerHTML = `<button role="button" id="main-manu-level-${i}" class="btn">Load level ${levelName}</button>`;
        domElement("#main-menu-container ul").appendChild(el);
        el.addEventListener("click", (evt) => {
          evt.preventDefault();
          startLevel(gameState);
        });
      }
    }

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

      playImperialMarch(gameState);
    });

    const m = {
      render: (gameState) => {
        switch (gameState.gameStatus()) {
          case "paused":
            show(continueBtn);
            show(menuContainer);
            hide(startBtn);
            break;
          case "init":
            hide(continueBtn);
            show(startBtn);
            show(menuContainer);
            break;
          case "finished":
            hide(continueBtn);
            show(congratulation)
            show(startBtn);
            show(menuContainer);
            break;
          case "play":
            hide(menuContainer);
            hide(congratulation)
            break;

          default:
            hide(menuContainer);
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

export function initGameOverMenu(gameState, continueFn) {
  const gameoverMenu = createMenu(gameState, (menu, gameState) => {
    const button = domElement("#restart-btn");
    const element = domElement("#game-over-menu");
    const menuInit = {
      element: element,
      button: button,
      render: (gameState) => {
        // Dynamic menu position

        if (gameState.gameStatus() === "gameover") {
          show(element);
        } else {
          hide(element);
        }
      },
    };

    button.addEventListener("click", (evt) => {
      console.log("POIOIOIOIoi");
      evt.preventDefault();
      if (gameState.gameStatus() === "gameover") {
        continueFn(gameState);
      }
    });
    return { ...menu, ...menuInit };
  });
  return gameoverMenu;
}
