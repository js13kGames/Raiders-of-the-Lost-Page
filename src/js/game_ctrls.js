import createController, { addEventListener } from "./controller.js";
import { renderText } from "./rendering.js";
import createEntity from "./entities.js";

export default function demoControllers(gameState) {
  // MAP GENERATION CONTROLLER
  const onClick = (event, ctrl, gameState) => {
    const status = gameState.gameStatus();
    const { canvas, ctx } = gameState.getByKeys(["canvas", "ctx"]);
    const x = event.pageX - canvas.offsetLeft;
    const y = event.pageY - canvas.offsetTop;
    let cnt = 10; // get in seconds
    const anim = createEntity({
      run: (gameState, element) => {
        element.position = { x, y };

        cnt--;
        if (cnt < 0) {
          return null;
        }
        return element;
      },
      render: (gameState, element) => {
        const { ctx } = gameState.getByKeys(["ctx"]);
        ctx.beginPath();
        ctx.fillStyle = "pink";

        ctx.arc(
          element.position.x,
          element.position.y,

          10,
          0,
          2 * Math.PI
        );
        ctx.fill();
      },
    });

    gameState.updateState((gameData) => ({
      ...gameData,
      entities: [...gameData.entities, anim],
    }));

    ctx.beginPath();
    ctx.fillStyle = "tomato";

    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fill();

    console.log(x, y);
  };

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
        break;
    }
  };

  const onKeyUp = (event, ctrl, gameState) => {
    const keyName = event.key;

    switch (keyName) {
      case "ArrowUp":
      case "ArrowDown":
        gameState.setState("moveV", null);
      case "ArrowLeft":
      case "ArrowRight":
        gameState.setState("moveH", null);
      default:
        break;
    }
  };

  const initCtrl = {};

  const keyboardCtrl = createController(initCtrl);

  keyboardCtrl.render = (gameState) => {
    const renderCtrl = (msg, pos) =>
      renderText(gameState, msg, pos, "black", "60px sans-serif");
    const mv = gameState.getState("moveV");
    const mh = gameState.getState("moveH");
    if (mv === "up") {
      renderCtrl("\u21E7", { x: 100, y: 100 });
    } else if (mv === "down") {
      renderCtrl("\u21E9", { x: 100, y: 100 });
    }
    if (mh === "left") {
      renderCtrl("\u21E6", { x: 100, y: 100 });
    } else if (mh === "right") {
      renderCtrl("\u21E8", { x: 100, y: 100 });
    }
  };

  const addKeyboardListener = (eventName, evtFunction) =>
    addEventListener(gameState, keyboardCtrl, eventName, evtFunction);

  const mouseCtrl = createController({});
  const addMouseListener = (evtFunction) =>
    addEventListener(gameState, mouseCtrl, "click", evtFunction);

  addKeyboardListener("keydown", onKeyDown);
  addKeyboardListener("keyup", onKeyUp);
  addMouseListener(onClick);
  gameState.addCtrl("main", keyboardCtrl);
  gameState.addCtrl("mouse", mouseCtrl);
}
