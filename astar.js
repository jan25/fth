import { Cell } from "utils.js";

export default findPath = (srcCell, destCell, grid) => {
  console.log("findPath called with", source, dest);
  const hueristic = (p1, p2) => {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
  };

  const unhashPoint = (pStr) => {
    let [x, y] = pStr.split(",");
    return { x: parseInt(x), y: parseInt(y) };
  };
  const hashPoint = (p) => {
    return `${p.x},${p.y}`;
  };
  const graph = new Map();
  for (const [pointStr, neighborPoints] of map) {
    graph.set(pointStr, neighborPoints);
  }
  console.log(graph);

  const eq = (p1, p2) => {
    return dist(p1, p2) < 2;
  };

  const dist = (p1, p2) => {
    return Math.sqrt(
      (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
    );
  };

  // TODO use priority queue
  const frontier = [];
  frontier.push([source, 0]);
  const cameFrom = new Map([[hashPoint(source), 0]]);
  const costSoFar = new Map([[hashPoint(source), 0]]);
  console.log(frontier, cameFrom, costSoFar);

  const getNext = () => {
    let bestIdx = 0;
    for (let i = 0; i < frontier.length; i++) {
      if (frontier[i][1] < frontier[bestIdx][1]) {
        bestIdx = i;
      }
    }
    [frontier[frontier.length - 1], frontier[bestIdx]] = [
      frontier[bestIdx],
      frontier[frontier.length - 1],
    ];
    return frontier.pop();
  };

  while (frontier.length > 0) {
    const current = getNext();
    const point = current[0];
    if (eq(point, dest)) {
      console.log("found path");
      break;
    }
    console.log(
      "processing",
      point,
      hashPoint(point),
      graph.get(hashPoint(point))
    );
    console.log(graph);
    for (const next of graph.get(hashPoint(point))) {
      const newCost = costSoFar.get(hashPoint(point)) + dist(point, next);
      if (
        !costSoFar.has(hashPoint(next)) ||
        newCost < costSoFar.get(hashPoint(next))
      ) {
        costSoFar.set(hashPoint(next), newCost);
        const priority = newCost + hueristic(dest, next);
        frontier.push([next, priority]);
        cameFrom.set(hashPoint(next), point);
      }
    }
  }

  const path = [dest];
  let current = dest;
  while (hashPoint(current) != hashPoint(source)) {
    current = cameFrom.get(hashPoint(current));
    path.push(current);
  }
  // [dest, ..., source]
  return path;

  //   frontier = PriorityQueue()
  // frontier.put(start, 0)
  // came_from = dict()
  // cost_so_far = dict()
  // came_from[start] = None
  // cost_so_far[start] = 0

  // while not frontier.empty():
  //    current = frontier.get()

  //    if current == goal:
  //       break

  //    for next in graph.neighbors(current):
  //       new_cost = cost_so_far[current] + graph.cost(current, next)
  //       if next not in cost_so_far or new_cost < cost_so_far[next]:
  //          cost_so_far[next] = new_cost
  //          priority = new_cost + heuristic(goal, next)
  //          frontier.put(next, priority)
  //          came_from[next] = current
};
