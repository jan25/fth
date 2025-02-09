export class Log {
  static DEBUG = false;
  static i(...parts) {
    if (this.DEBUG) {
      console.log(...parts);
    }
  }
}

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
    // TODO use sparse grid
    this.grid = [...Array(nRows)].map(() =>
      [...Array(nCols)].map(() => Grid.EMPTY)
    );

    this.spritePos = null;
    this.heartPos = null;
  }

  static toHash = (row, col) => {
    return `hash(${row},${col})`;
  };

  moveSprite = (rowInc, colInc) => {
    const [newRow, newCol] = [
      this.spritePos.r + rowInc,
      this.spritePos.c + colInc,
    ];
    Log.i("value at", newRow, newCol, this.grid[newRow][newCol], Grid.OBSTACLE);
    if (
      this.outOfBounds(newRow, newCol) ||
      this.grid[newRow][newCol] == Grid.OBSTACLE
    ) {
      return false;
    }
    this.spritePos = new Pos(newRow, newCol);
    return true;
  };

  outOfBounds = (row, col) => {
    return row < 0 || col < 0 || row >= this.nRows || col >= this.nCols;
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
    Log.i("setting obstacle at", row, col);
    const cell = new Pos(row, col);
    if (this.spritePos.eq(cell) || this.heartPos.eq(cell)) {
      // TODO throw error
      return false;
    }
    this.grid[row][col] = Grid.OBSTACLE;
    return true;
  }

  createObstacles() {
    const numObs = 10;
    [...Array(numObs)].forEach(() => {
      const [r, c] = [randInt(this.nRows), randInt(this.nCols)];
      this.setObstacle(r, c);
    });
  }
}

export const randInt = (maxInt) => {
  // right exclusive [0, maxInt)
  return Math.floor(Math.random() * maxInt);
};
