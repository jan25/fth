export class Log {
  static DEBUG = false;
  static i(...msgs) {
    if (this.DEBUG) {
      console.log(...msgs);
    }
  }
}

class Pos {
  constructor(r, c) {
    this.r = r;
    this.c = c;
  }

  *neighbors() {
    yield new Pos(this.r + 1, this.c);
    yield new Pos(this.r - 1, this.c);
    yield new Pos(this.r, this.c + 1);
    yield new Pos(this.r, this.c - 1);
  }

  dist(other) {
    return Math.abs(this.r - other.r) + Math.abs(this.c - other.c);
  }

  eq(other) {
    return this.r === other.r && this.c === other.c;
  }

  hash() {
    return `hash:${this.r},${this.c}`;
  }
}

class Queue {
  constructor() {
    this.stack = [];
    this.revStack = [];
  }

  add(val) {
    this.stack.push(val);
  }

  rm() {
    if (this.revStack.length === 0) {
      while (this.stack.length > 0) {
        this.revStack.push(this.stack.pop());
      }
    }
    return this.revStack.pop();
  }

  isEmpty() {
    return this.stack.length + this.revStack.length === 0;
  }
}

class PosSet {
  constructor() {
    this.list = [];
    this.map = new Map();
  }

  add(pos) {
    this.list.push(pos);
    this.map.set(pos.hash(), this.list.length - 1);
  }

  #swap(i, j) {
    [this.list[i], this.list[j]] = [this.list[j], this.list[i]];
  }

  rm(pos) {
    const idx = this.map.get(pos.hash());
    this.#swap(idx, this.list.length - 1);
    this.map.set(this.list[idx].hash(), idx);
    this.map.delete(pos.hash());
    this.list.pop();
  }

  rmRand() {
    const idx = randInt(this.list.length);
    const pos = this.list[idx];
    this.rm(pos);
    return pos;
  }

  size() {
    return this.list.length;
  }
}

export class Grid {
  constructor(nRows, nCols) {
    this.nRows = nRows;
    this.nCols = nCols;

    this.emptyCells = new PosSet();
    range(this.nRows)().forEach((_, row) =>
      range(this.nCols)().forEach((_, col) => {
        this.emptyCells.add(new Pos(row, col));
      })
    );

    this.heartPos = null;
    this.spritePos = null;
    // Steps for sprite to walk. Next step is last in list.
    this.spritePath = [];
  }

  static create(nRows, nCols, nObs) {
    const grid = new Grid(nRows, nCols);
    grid.#createObstacles(nObs);
    grid.spritePos = grid.emptyCells.rmRand();
    grid.heartPos = grid.emptyCells.rmRand();
    return grid;
  }

  isEmpty(row, col) {
    return this.emptyCells.map.has(new Pos(row, col).hash());
  }

  isObstacle(row, col) {
    return (
      !this.isEmpty(row, col) &&
      !this.isSprite(row, col) &&
      !this.isHeart(row, col)
    );
  }

  isObstaclePos(pos) {
    return this.isObstacle(pos.r, pos.c);
  }

  moveSprite(rowInc, colInc) {
    const [newRow, newCol] = [
      this.spritePos.r + rowInc,
      this.spritePos.c + colInc,
    ];
    this.setSprite(new Pos(newRow, newCol));
    return true;
  }

  setSprite(newPos) {
    if (
      this.outOfBounds(newPos.r, newPos.c) ||
      this.isObstacle(newPos.r, newPos.c)
    ) {
      return false;
    }
    if (this.spritePos !== null) {
      this.emptyCells.add(this.spritePos);
    }
    this.spritePos = newPos;
    this.emptyCells.rm(this.spritePos);
    return true;
  }

  walkSprite() {
    if (this.spritePath.length === 0) {
      return false;
    }
    this.setSprite(this.spritePath.pop());
    return true;
  }

  computeSpritePath(destRow, destCol) {
    const dest = new Pos(destRow, destCol);
    let best = this.spritePos;
    const prevPos = new Map();
    prevPos.set(best.hash(), null);

    const q = new Queue();
    q.add(best);
    while (!q.isEmpty()) {
      const next = q.rm();
      for (const neighbor of next.neighbors()) {
        if (
          this.outOfBoundsPos(neighbor) ||
          this.isObstaclePos(neighbor) ||
          prevPos.has(neighbor.hash())
        ) {
          continue;
        }
        prevPos.set(neighbor.hash(), next);
        q.add(neighbor);
        if (dest.dist(neighbor) < dest.dist(best)) {
          best = neighbor;
        }
      }
    }

    this.spritePath = [];
    while (!best.eq(this.spritePos)) {
      this.spritePath.push(best);
      best = prevPos.get(best.hash());
    }
    Log.i("computed path", this.spritePath);
  }

  outOfBounds(row, col) {
    return row < 0 || col < 0 || row >= this.nRows || col >= this.nCols;
  }

  outOfBoundsPos(pos) {
    return this.outOfBounds(pos.r, pos.c);
  }

  isSprite(row, col) {
    return new Pos(row, col).eq(this.spritePos);
  }

  moveHeart() {
    const newHeartPos = this.emptyCells.rmRand();
    this.emptyCells.add(this.heartPos);
    this.heartPos = newHeartPos;
  }

  isHeartReached() {
    return this.spritePos.eq(this.heartPos);
  }

  isHeart(row, col) {
    return new Pos(row, col).eq(this.heartPos);
  }

  setObstacle(nObs) {
    range(nObs)().forEach(() => {
      if (this.emptyCells.size() > 0) {
        this.emptyCells.rmRand();
      }
    });
  }

  rmObstacle(row, col) {
    this.emptyCells.add(new Pos(row, col));
  }

  #createObstacles(nObs) {
    range(nObs)().forEach(() => {
      this.emptyCells.rmRand();
    });
  }
}

export const randInt = (maxInt) => {
  // right exclusive [0, maxInt)
  return Math.floor(Math.random() * maxInt);
};

// cached range iterator
export const range = (n) => {
  const l = [...Array(n)];
  return () => l;
};
