import { Grid } from "./grid.js";
import { Log, range, Storage } from "./utils.js";

// dimensions
const FRAME_RATE = 9;
const CANVAS_W = 500;
const CANVAS_H = 500;
const CANVAS_BUFFER = 50;
const ROWS = 20;
const COLS = 20;
const N_OBSTACLES = 100;
const CELL_W = CANVAS_W / COLS;
const SPRITE_SHEET_ROWS = 4;
const SPRITE_FRAME_W = 192 / SPRITE_SHEET_ROWS;
const ZOOM_SPITE_PX = 7;
const HEART_SHEET_FRAMES = 12;
const HEART_FRAME_W = 384 / HEART_SHEET_FRAMES;
const TEXT_SIZE_L = 14;
const TEXT_SIZE_M = 8;
const TEXT_PAD = 10;

// colors
const BG_COL = 200;

// assets
let sprite;
let heart;
let tiles;
let bell;
let pop;

// state
let grid;
let level;
let [spriteFrameRow, spriteFrameCol] = [0, 0];
let heartFrame = 0;
let score;
let bombsLeft;
let bestScore;

export default new p5((p) => {
  // helpers
  const h = {};

  p.preload = () => {
    sprite = p.loadImage("assets/george.png");
    heart = p.loadImage("assets/heart.png");
    tiles = p.loadImage("assets/tiles.png");
    bell = p.createAudio("/assets/bell.wav");
    pop = p.createAudio("/assets/pop.ogg");
    h.rangeRows = range(ROWS);
    h.rangeCols = range(COLS);

    h.newGame();
  };

  h.newGame = () => {
    h.initNewGrid();
    score = 0;
    bestScore = Storage.get("best", 0);
  };

  h.initNewGrid = () => {
    grid = Grid.create(ROWS, COLS, N_OBSTACLES);
    bombsLeft = ROWS;
    level = 5;
  };

  p.setup = () => {
    p.createCanvas(CANVAS_W, CANVAS_H + CANVAS_BUFFER);
    p.frameRate(FRAME_RATE);
  };

  p.draw = () => {
    p.background(BG_COL);

    h.showMsg();
    h.showScores();
    h.walkSprite();
    h.renderGrid();

    h.updateIfKeyReached();
    h.updateHeartIfReached();
  };

  // should work on touch too
  p.mousePressed = () => {
    const [col, row] = [
      Math.floor(p.mouseX / CELL_W),
      Math.floor(p.mouseY / CELL_W),
    ];
    if (grid.outOfBounds(row, col)) {
      return;
    }

    if (grid.isKey(row, col, true)) {
      // Skull key
      h.newGame();
      return;
    }

    // if obstacle -> clear
    if (bombsLeft > 0 && grid.isObstacle(row, col)) {
      Log.i("removing obstacle at", row, col);
      bombsLeft--;
      grid.rmObstacle(row, col);
      pop.play();
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
          h.renderWall(h.gridX(colIdx), h.gridY(rowIdx));
        } else {
          h.renderEmptyCell(h.gridX(colIdx), h.gridY(rowIdx));
        }
      })
    );
    h.renderSprite();
    h.renderHeart();
    h.renderKeys();
  };

  h.updateHeartIfReached = () => {
    if (grid.isHeartReached()) {
      grid.moveHeart();
      grid.setObstacle(level);
      grid.createKeys();

      score++;
      level++;
      Storage.set("best", Math.max(bestScore, score));
      bell.play();
    }
  };

  h.updateIfKeyReached = () => {
    if (grid.isKeyReached()) {
      h.initNewGrid();
    }
  };

  p.keyPressed = () => {
    if (!Log.DEBUG) return;
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

  h.renderKeys = () => {
    if (grid.keyPos == null) return;
    h.renderKey(h.gridX(grid.keyPos.c), h.gridY(grid.keyPos.r));
    h.renderKey(
      h.gridX(grid.skullKeyPos.c),
      h.gridY(grid.skullKeyPos.r),
      true // skull
    );
  };

  h.showScores = () => {
    p.push();
    const [x, y] = [TEXT_PAD, CANVAS_H + TEXT_PAD / 3];
    p.textStyle(p.NORMAL);
    p.textSize(TEXT_SIZE_L);
    p.text(`${score} ❤️picked`, x, y + TEXT_SIZE_L);
    p.text(`${bombsLeft} 💥left`, x, y + 2 * TEXT_SIZE_L);
    p.textSize(TEXT_SIZE_M);
    p.textStyle(p.ITALIC);
    p.text(
      `Best was ${bestScore} heart${bestScore != 1 ? "s" : ""}`,
      x,
      y + 2 * TEXT_SIZE_L + TEXT_SIZE_M + TEXT_PAD / 2
    );
    p.pop();
  };

  h.showMsg = () => {
    p.push();
    const msg = h.getMsg();
    p.textStyle(p.BOLDITALIC);
    p.textSize(TEXT_SIZE_L);
    p.text(
      msg,
      CANVAS_W - p.textWidth(msg) - TEXT_PAD,
      CANVAS_H + CANVAS_BUFFER / 2
    );
    p.pop();
  };

  h.getMsg = () => {
    const [col, row] = [
      Math.floor(p.mouseX / CELL_W),
      Math.floor(p.mouseY / CELL_W),
    ];
    if (grid.isObstacle(row, col)) {
      return bombsLeft > 0 ? "💥Destory wall!" : "⚠No bombs left";
    }
    if (grid.isKey(row, col)) {
      return "🗝️Key to new life";
    }
    if (grid.isKey(row, col, true)) {
      return "🆘Teleport & Quit‼️";
    }
    // empty
    return "🏃🏻‍♂️‍➡️Click to run";
  };

  h.renderWall = (x, y) => {
    p.image(tiles, x, y, CELL_W, CELL_W, 32, 0, 32, 32);
  };

  h.renderEmptyCell = (x, y) => {
    p.image(tiles, x, y, CELL_W, CELL_W, 0, 0, 32, 32);
  };

  h.renderKey = (x, y, skull = false) => {
    p.image(tiles, x, y, CELL_W, CELL_W, 4 * 32, skull ? 32 : 0, 32, 32);
  };

  h.gridX = (cellX) => {
    return cellX * CELL_W;
  };

  h.gridY = (cellY) => {
    return cellY * CELL_W;
  };
});
