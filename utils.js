export class Log {
  static DEBUG = false;
  static i(...msgs) {
    if (this.DEBUG) {
      console.log(...msgs);
    }
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

export class Storage {
  static set = (k, v) => {
    sessionStorage.setItem(`key:${k}`, v);
  };

  static get = (k, defaultVal = undefined) => {
    return sessionStorage.getItem(`key:${k}`) || defaultVal;
  };

  static rm = (k) => {
    sessionStorage.removeItem(`key:${k}`);
  };
}
