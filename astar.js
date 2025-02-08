console.log("load astar.js");

const findPath = (source, dest, map) => {
  const hueristic = (p1, p2) => {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
  };

  const serialize = (p) => {
    return `(${p.x}, ${p.y})`;
  };
  const graph = new Map();
  for (const [point, neighborPoints] of map) {
    graph.set(serialize(point), neighborPoints);
  }
  console.log(graph);

  const eq = (p1, p2) => {
    return p1.x == p2.x && p1.y == p2.y;
  };

  const dist = (p1, p2) => {
    return Math.sqrt(
      (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
    );
  };

  // TODO use priority queue
  const frontier = [];
  frontier.push([source, 0]);
  const cameFrom = new Map([[serialize(source), 0]]);
  const costSoFar = new Map([[serialize(source), 0]]);

  const getNext = () => {
    const bestIdx = 0;
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
    console.log("foo");
    const current = getNext();
    const point = current[0];
    if (eq(point, dest)) {
      break;
    }
    for (const next of graph.get(serialize(point))) {
      const newCost = costSoFar.get(serialize(point)) + dist(point, next);
      if (
        !costSoFar.has(serialize(next)) ||
        newCost < costSoFar.get(serialize(next))
      ) {
        costSoFar.set(serialize(next), newCost);
        const priority = newCost + hueristic(dest, next);
        frontier.push([next, priority]);
        cameFrom.set(serialize(next), point);
      }
    }
  }

  const path = [dest];
  let current = dest;
  while (serialize(current) != serialize(source)) {
    current = cameFrom.get(serialize(current));
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
