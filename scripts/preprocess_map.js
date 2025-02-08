import pkg from "lodash";
import fs from "fs";
const _ = pkg;
import { Segment, Point } from "@flatten-js/core";
import { hashLine, hashPoint } from "utils.js";

// TODO replace with real coordinates from map.
const InitPoints = [
  [296, 250.5],
  [376, 175.5],
  [436, 241.5],
  [360, 248.5],
  [354, 317.5],
  [428, 316.5],
  [377, 219.5],
  [449, 175.5],
  [365, 46.5],
  [230, 177.5],
  [324, 268.5],
  [142, 258.5],
  [281, 189.5],
  [227, 63.5],
  [191, 310.5],
  [297, 314.5],
  [291, 386.5],
  [188, 381.5],
  [190, 309.5],
  [101, 316.5],
  [98, 388.5],
  [123, 466.5],
  [198, 444.5],
  [187, 379.5],
  [95, 388.5],
];

const main = () => {
  const lines = [];
  const intersectionsPerLine = new Map();
  for (let i = 1; i < InitPoints.length; i++) {
    const [start, end] = [
      new Point(...InitPoints[i - 1]),
      new Point(...InitPoints[i]),
    ];
    const line = new Segment(start, end);
    intersectionsPerLine.set(hashLine(line), [start, end]);
    lines.push(line);
  }

  const isValidIntersection = (point, line) => {
    const [start, end] = intersectionsPerLine.get(hashLine(line));
    let [lx, rx] = [start.x, end.x];
    if (lx > rx) {
      [lx, rx] = [rx, lx];
    }
    if (point.x < lx || point.x > rx) {
      return false;
    }

    let [ly, ry] = [start.y, end.y];
    if (ly > ry) {
      [ly, ry] = [ry, ly];
    }
    if (point.y < ly || point.y > ry) {
      return false;
    }
    return true;
  };

  for (let i = 0; i < lines.length; ++i) {
    const line1 = lines[i];
    for (let j = i + 1; j < lines.length; ++j) {
      const line2 = lines[j];
      const intersections = line1.intersect(line2);
      // at most 1 intersection between lines
      for (const intersection of intersections) {
        if (
          !isValidIntersection(intersection, line1) ||
          !isValidIntersection(intersection, line2)
        ) {
          continue;
        }
        intersectionsPerLine.get(hashLine(line1)).push(intersection);
        intersectionsPerLine.get(hashLine(line2)).push(intersection);
      }
    }
  }

  const graph = new Map();
  const addEdge = (a, b) => {
    const [aHash, bHash] = [hashPoint(a), hashPoint(b)];
    if (!graph.has(aHash)) {
      graph.set(aHash, []);
    }
    if (!graph.has(bHash)) {
      graph.set(bHash, []);
    }
    graph.get(aHash).push(b);
    graph.get(bHash).push(a);
  };

  // TODO verify duplicate intersections in intersectionsPerLine
  for (const ints of intersectionsPerLine) {
    const points = ints[1];
    _.sortBy(points, (p) => [p.x, p.y]);
    for (let i = 1; i < points.length; ++i) {
      const [prev, cur] = [points[i - 1], points[i]];
      if (prev.x == cur.x && prev.y == cur.y) continue;
      addEdge(cur, prev);
    }
  }

  // TODO cache lines as optimization to find nearest line in the app.
  // List of tuples
  // [[sourcePointSerialized, [neighborPoint]]...]
  console.log(JSON.stringify(Array.from(graph)));
  fs.writeFileSync(
    "preprocess_map_output.json",
    JSON.stringify({ map: Array.from(graph) })
  );
};

let l = new Segment(new Point(1, 2), new Point(3, 4));
console.log(l.start, l.end);

main();
