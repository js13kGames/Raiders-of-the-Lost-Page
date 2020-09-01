import createController, { addEventListener } from "./controller.js";
import { renderText } from "./rendering.js";
import createEntity from "./entities.js";
import { exportMap, canvasPosToTile } from "./map.js";

import { create404Entity } from "./game_entities.js";

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
      case "s":
        console.log(
          exportMap(gameState.getState("map"), gameState.getState("entities"))
        );
        break;
      case " ":
        gameState.setState("ghost", true);
        break;
      case "Control":
        gameState.setState("ghost", true);
        break;
      default:
        console.log(keyName);
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

      case " ":
        gameState.setState("ghost", false);
        break;
      default:
        gameState.setState("key", null);
        break;
    }
  };

  const initCtrl = {};

  const keyboardCtrl = createController(initCtrl);

  // keyboardCtrl.render = (gameState) => {
  //   const renderCtrl = (msg, pos) =>
  //     renderText(gameState, msg, pos, "black", "60px sans-serif");
  //   const mv = gameState.getState("moveV");
  //   const mh = gameState.getState("moveH");
  //   if (mv === "up") {
  //     renderCtrl("\u21E7", { x: 100, y: 100 });
  //   } else if (mv === "down") {
  //     renderCtrl("\u21E9", { x: 100, y: 100 });
  //   }
  //   if (mh === "left") {
  //     renderCtrl("\u21E6", { x: 100, y: 100 });
  //   } else if (mh === "right") {
  //     renderCtrl("\u21E8", { x: 100, y: 100 });
  //   }
  // };

  const addKeyboardListener = (eventName, evtFunction) =>
    addEventListener(gameState, keyboardCtrl, eventName, evtFunction);

  addKeyboardListener("keydown", onKeyDown);
  addKeyboardListener("keyup", onKeyUp);

  gameState.addCtrl("main", keyboardCtrl);
}
