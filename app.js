import { Log, Grid, randInt } from "./utils.js";

// dimensions
const CANVAS_W = 500;
const CANVAS_H = 500;
const ROWS = 20;
const COLS = 20;
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

    grid = new Grid(ROWS, COLS);
    grid.setSprite(1, 1);
    grid.setHeart(randInt(ROWS), randInt(COLS));
    grid.createObstacles();
    Log.i("grid", grid.grid);
  };

  p.setup = () => {
    p.createCanvas(CANVAS_W, CANVAS_H);
  };

  p.draw = () => {
    p.background(BG_COL);

    h.renderGrid();

    h.registerKeyDownHandlers();

    h.updateHeartIfReached();
  };

  p.keyPressed = () => {};

  h.renderGrid = () => {
    for (const rowIdx in grid.grid) {
      for (const colIdx in grid.grid[rowIdx]) {
        if (grid.grid[rowIdx][colIdx] === Grid.OBSTACLE) {
          h.renderObstacle(rowIdx, colIdx);
        }
      }
    }
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
    if (!grid.spritePos.eq(grid.heartPos)) {
      return;
    }

    grid.setHeart(randInt(ROWS), randInt(COLS));
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
