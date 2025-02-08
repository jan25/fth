export const hashLine = (line) => {
  return `${line.start.x},${line.start.y},${line.end.x},${line.end.y}`;
};
export const hashPoint = (p) => {
  return `${p.x},${p.y}`;
};
