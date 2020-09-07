import createController, { addEventListener } from "./controller.js";

export default function gameControllers(gameState) {
  // MAP GENERATION CONTROLLER

  const onKeyDown = (event, ctrl, gameState) => {
    const keyName = event.key;

    switch (keyName) {
      case "ArrowUp":
        gameState.setState("moveV", "up");
        break;
      case "ArrowDown":
        gameState.setState("moveV", "down");
        break;
      case "ArrowLeft":
        gameState.setState("moveH", "left");
        break;
      case "ArrowRight":
        gameState.setState("moveH", "right");
        break;
      default:
        gameState.setState("key", keyName);
        break;
    }
  };

  const onKeyUp = (event, ctrl, gameState) => {
    const keyName = event.key;

    switch (keyName) {
      case "ArrowUp":
      case "ArrowDown":
        gameState.setState("moveV", null);
        break;
      case "ArrowLeft":
      case "ArrowRight":
        gameState.setState("moveH", null);
        break;
      default:
        gameState.setState("key", null);
        break;
    }
  };

  const initCtrl = {};

  const keyboardCtrl = createController(initCtrl);


  const addKeyboardListener = (eventName, evtFunction) =>
    addEventListener(gameState, keyboardCtrl, eventName, evtFunction);

  addKeyboardListener("keydown", onKeyDown);
  addKeyboardListener("keyup", onKeyUp);

  gameState.addCtrl("main", keyboardCtrl);
}
