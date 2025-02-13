import { Grid } from "./grid.js";
import { Log, range } from "./utils.js";

// dimensions
const FRAME_RATE = 9;
const CANVAS_W = 500;
const CANVAS_H = 500;
const ROWS = 20;
const COLS = 20;
const N_OBSTACLES = 200;
const CELL_W = CANVAS_W / COLS;
const SPRITE_SHEET_ROWS = 4;
const SPRITE_FRAME_W = 192 / SPRITE_SHEET_ROWS;
const ZOOM_SPITE_PX = 10;
const HEART_SHEET_FRAMES = 12;
const HEART_FRAME_W = 384 / HEART_SHEET_FRAMES;

// colors
const BG_COL = "grey";

// assets
let sprite;
let heart;

// state
let grid;
let level = 1;
let [spriteFrameRow, spriteFrameCol] = [0, 0];
let heartFrame = 0;

export default new p5((p) => {
  // helpers
  const h = {};

  p.preload = () => {
    sprite = p.loadImage("assets/george.png");
    heart = p.loadImage("assets/heart.png");
    h.rangeRows = range(ROWS);
    h.rangeCols = range(COLS);

    grid = Grid.create(ROWS, COLS, N_OBSTACLES);
  };

  p.setup = () => {
    p.createCanvas(CANVAS_W, CANVAS_H);
    p.frameRate(FRAME_RATE);
  };

  p.draw = () => {
    p.background(BG_COL);

    h.walkSprite();
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
      grid.setObstacle(level);
      grid.rmObstacle(row, col);
    }
    // if empty or heart -> walk towards it
    else if (!grid.isSprite(row, col)) {
      grid.computeSpritePath(row, col);
    }
  };

  h.walkSprite = () => {
    if (grid.walkSprite()) {
      spriteFrameRow = (spriteFrameRow + 1) % SPRITE_SHEET_ROWS;
      spriteFrameCol = grid.spriteDir();
    } else {
      spriteFrameRow = 2; // Still stance in sprite sheet
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
      //   level++;
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
      h.gridX(grid.spritePos.c) - ZOOM_SPITE_PX / 2,
      h.gridY(grid.spritePos.r) - ZOOM_SPITE_PX / 2,
      CELL_W + ZOOM_SPITE_PX,
      CELL_W + ZOOM_SPITE_PX,
      spriteFrameCol * SPRITE_FRAME_W,
      spriteFrameRow * SPRITE_FRAME_W,
      SPRITE_FRAME_W,
      SPRITE_FRAME_W
    );
  };

  h.renderHeart = () => {
    heartFrame = (heartFrame + 1) % HEART_SHEET_FRAMES;
    p.image(
      heart,
      h.gridX(grid.heartPos.c),
      h.gridY(grid.heartPos.r),
      CELL_W,
      CELL_W,
      heartFrame * HEART_FRAME_W,
      0,
      HEART_FRAME_W,
      HEART_FRAME_W
    );
  };

  h.gridX = (cellX) => {
    return cellX * CELL_W;
  };

  h.gridY = (cellY) => {
    return cellY * CELL_W;
  };
});
