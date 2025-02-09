import { Grid } from "./utils.js";

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
    grid.setHeart(h.randInt(ROWS), h.randInt(COLS));
  };

  p.setup = () => {
    p.createCanvas(CANVAS_W, CANVAS_H);
  };

  p.draw = () => {
    p.background(BG_COL);

    h.renderSprite();
    h.renderHeart();

    h.registerKeyDownHandlers();

    h.updateHeartIfReached();
  };

  p.keyPressed = () => {};

  h.updateHeartIfReached = () => {
    if (!grid.spritePos.eq(grid.heartPos)) {
      return;
    }

    grid.setHeart(h.randInt(ROWS), h.randInt(COLS));
  };

  h.registerKeyDownHandlers = () => {
    if (p.keyIsDown(p.UP_ARROW)) {
      grid.spritePos.r -= 1;
    } else if (p.keyIsDown(p.DOWN_ARROW)) {
      grid.spritePos.r += 1;
    } else if (p.keyIsDown(p.RIGHT_ARROW)) {
      grid.spritePos.c += 1;
    } else if (p.keyIsDown(p.LEFT_ARROW)) {
      grid.spritePos.c -= 1;
    }
    // TODO restrict movements to the grid
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

  h.randInt = (maxInt) => {
    // right exclusive [0, maxInt)
    return Math.floor(Math.random() * maxInt);
  };
});
