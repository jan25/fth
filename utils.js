class Pos {
  constructor(r, c) {
    this.r = r;
    this.c = c;
  }

  eq(other) {
    return this.r === other.r && this.c === other.c;
  }
}

export class Grid {
  static EMPTY = 0;
  static OBSTACLE = 3;
  // TODO add a BUSY cell for sprite/heart?

  constructor(nRows, nCols) {
    this.nRows = nRows;
    this.nCols = nCols;
    this.grid = [...Array(nRows)].map(() =>
      [...Array(nCols)].map(() => this.EMPTY)
    );

    this.spritePos = null;
    this.heartPos = null;
  }

  static toHash = (row, col) => {
    return `hash(${row},${col})`;
  };

  setSprite = (row, col) => {
    // TODO assert sprite location
    this.spritePos = new Pos(row, col);
  };

  isSprite = (row, col) => {
    return new Pos(row, col).eq(this.sprite);
  };

  setHeart = (row, col) => {
    // TODO assert heart location
    this.heartPos = new Pos(row, col);
  };

  isHeart(row, col) {
    return new Pos(row, col).eq(this.heart);
  }

  setObstacle(row, col) {
    const cell = new Pos(row, col);
    if (this.sprite.eq(cell) || this.heart.eq(cell)) {
      // TODO throw error
      return;
    }
    this.grid[row][col] = this.OBSTACLE;
  }
}
