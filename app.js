import { Log, Grid, range } from "./utils.js";

// dimensions
const CANVAS_W = 500;
const CANVAS_H = 500;
const ROWS = 20;
const COLS = 20;
const N_OBSTACLES = 200;
const CELL_W = CANVAS_W / COLS;

// colors
const BG_COL = "grey";

// assets
let sprite;
let heart;

// state
let grid;

export default new p5((p) => {
  // helpers
  const h = {};

  p.preload = () => {
    sprite = p.loadImage("mario.png");
    heart = p.loadImage("heart_16x16.png");
    h.rangeRows = range(ROWS);
    h.rangeCols = range(COLS);

    grid = Grid.create(ROWS, COLS, N_OBSTACLES);
  };

  p.setup = () => {
    p.createCanvas(CANVAS_W, CANVAS_H);
    p.frameRate(10);
  };

  p.draw = () => {
    p.background(BG_COL);

    grid.walkSprite();
    h.renderGrid();

    h.registerKeyDownHandlers();

    h.updateHeartIfReached();
  };

  // should work on touch too
  p.mousePressed = () => {
    const [col, row] = [
      Math.floor(p.mouseX / CELL_W),
      Math.floor(p.mouseY / CELL_W),
    ];
    if (grid.outOfBounds(row, col)) {
      Log.i("out of bounds", row, col);
      return;
    }

    // if obstacle -> clear and set elsewhere
    if (grid.isObstacle(row, col)) {
      Log.i("swapping obstacle at", row, col);
      grid.setObstacle();
      grid.rmObstacle(row, col);
    }
    // if empty or heart -> walk towards it
    else if (!grid.isSprite(row, col)) {
      grid.computeSpritePath(row, col);
    }
  };

  h.renderGrid = () => {
    h.rangeRows().forEach((_, rowIdx) =>
      h.rangeCols().forEach((_, colIdx) => {
        if (grid.isObstacle(rowIdx, colIdx)) {
          h.renderObstacle(rowIdx, colIdx);
        }
      })
    );
    h.renderSprite();
    h.renderHeart();
  };

  h.renderObstacle = (row, col) => {
    const [x, y] = [h.gridX(col), h.gridY(row)];
    p.push();
    p.fill("black");
    p.rect(x, y, CELL_W, CELL_W);
    p.pop();
  };

  h.updateHeartIfReached = () => {
    if (grid.isHeartReached()) {
      // TODO show message
      grid.moveHeart();
    }
  };

  h.registerKeyDownHandlers = () => {};

  p.keyPressed = () => {
    Log.i(p.key);
    if (p.keyCode == p.UP_ARROW) {
      grid.moveSprite(-1, 0);
    } else if (p.keyCode == p.DOWN_ARROW) {
      grid.moveSprite(1, 0);
    } else if (p.keyCode == p.LEFT_ARROW) {
      grid.moveSprite(0, -1);
    } else if (p.keyCode == p.RIGHT_ARROW) {
      grid.moveSprite(0, 1);
    }
  };

  h.renderSprite = () => {
    p.image(
      sprite,
      h.gridX(grid.spritePos.c),
      h.gridY(grid.spritePos.r),
      CELL_W,
      CELL_W
    );
  };

  h.renderHeart = () => {
    p.image(
      heart,
      h.gridX(grid.heartPos.c),
      h.gridY(grid.heartPos.r),
      CELL_W,
      CELL_W
    );
  };

  h.gridX = (cellX) => {
    return cellX * CELL_W;
  };

  h.gridY = (cellY) => {
    return cellY * CELL_W;
  };
});
