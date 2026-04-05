import { DIRS } from "../../constants";

const manhattan = (r, c, er, ec) => Math.abs(r - er) + Math.abs(c - ec);
const euclidean = (r, c, er, ec) => Math.sqrt((r - er) ** 2 + (c - ec) ** 2);
const diagonal = (r, c, er, ec) => Math.max(Math.abs(r - er), Math.abs(c - ec));

export const HEURISTICS = { manhattan, euclidean, diagonal };

export function* astar(grid, start, end, heuristicName = "manhattan") {
  const h = HEURISTICS[heuristicName];
  const rows = grid.length,
    cols = grid[0].length;
  const g = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const f = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
  const closed = Array.from({ length: rows }, () => Array(cols).fill(false));
  const hMap = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => h(r, c, end[0], end[1])),
  );

  g[start[0]][start[1]] = 0;
  f[start[0]][start[1]] = hMap[start[0]][start[1]];
  const open = [[f[start[0]][start[1]], start[0], start[1]]];
  let visited = 0,
    frontierCount = 0;

  while (open.length) {
    open.sort((a, b) => a[0] - b[0]);
    const [fc, r, c] = open.shift();
    if (closed[r][c]) continue;
    closed[r][c] = true;
    visited++;

    yield {
      type: "visit",
      r,
      c,
      gCost: g[r][c],
      hCost: hMap[r][c],
      fCost: fc,
      visited,
      frontier: frontierCount,
      heatmap: hMap,
      narrate: `Expanding (${r},${c}) — g=${g[r][c].toFixed(1)}, h=${hMap[r][c].toFixed(1)}, f=${fc.toFixed(1)}. Always picks lowest f-cost node.`,
    };

    if (r === end[0] && c === end[1]) {
      const path = [];
      let cur = [r, c];
      while (cur) {
        path.unshift(cur);
        cur = parent[cur[0]][cur[1]];
      }
      for (const [pr, pc] of path)
        yield {
          type: "path",
          r: pr,
          c: pc,
          visited,
          frontier: frontierCount,
          narrate: "Tracing optimal path back via parent pointers.",
        };
      yield {
        type: "done",
        found: true,
        pathLen: path.length,
        visited,
        frontier: frontierCount,
        narrate: `Found! Path length: ${path.length}. A* explored ${visited} cells — heuristic kept it focused.`,
      };
      return;
    }

    for (const [dr, dc] of DIRS) {
      const nr = r + dr,
        nc = c + dc;
      if (
        nr < 0 ||
        nr >= rows ||
        nc < 0 ||
        nc >= cols ||
        closed[nr][nc] ||
        grid[nr][nc] === "wall"
      )
        continue;
      const cost = grid[nr][nc] === "weight" ? 3 : 1;
      const ng = g[r][c] + cost;
      if (ng < g[nr][nc]) {
        g[nr][nc] = ng;
        f[nr][nc] = ng + hMap[nr][nc];
        parent[nr][nc] = [r, c];
        frontierCount++;
        open.push([f[nr][nc], nr, nc]);
        yield {
          type: "frontier",
          r: nr,
          c: nc,
          gCost: ng,
          hCost: hMap[nr][nc],
          fCost: f[nr][nc],
          visited,
          frontier: frontierCount,
          narrate: `Added (${nr},${nc}) to open set. f=${f[nr][nc].toFixed(1)}.`,
        };
      }
    }
  }
  yield {
    type: "done",
    found: false,
    visited,
    frontier: frontierCount,
    narrate: "No path found — all reachable cells exhausted.",
  };
}

export function* dijkstra(grid, start, end) {
  const rows = grid.length,
    cols = grid[0].length;
  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
  const vis = Array.from({ length: rows }, () => Array(cols).fill(false));
  dist[start[0]][start[1]] = 0;
  const pq = [[0, start[0], start[1]]];
  let visited = 0,
    frontierCount = 0;

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, r, c] = pq.shift();
    if (vis[r][c]) continue;
    vis[r][c] = true;
    visited++;
    yield {
      type: "visit",
      r,
      c,
      gCost: d,
      hCost: 0,
      fCost: d,
      visited,
      frontier: frontierCount,
      narrate: `Processing (${r},${c}) — dist=${d}. Dijkstra always picks the globally closest unvisited node.`,
    };

    if (r === end[0] && c === end[1]) {
      const path = [];
      let cur = [r, c];
      while (cur) {
        path.unshift(cur);
        cur = parent[cur[0]][cur[1]];
      }
      for (const [pr, pc] of path)
        yield {
          type: "path",
          r: pr,
          c: pc,
          visited,
          frontier: frontierCount,
          narrate: "Tracing shortest path.",
        };
      yield {
        type: "done",
        found: true,
        pathLen: path.length,
        visited,
        frontier: frontierCount,
        narrate: `Shortest path found! Length: ${path.length}. Dijkstra visited ${visited} cells — no heuristic, explores in all directions.`,
      };
      return;
    }
    for (const [dr, dc] of DIRS) {
      const nr = r + dr,
        nc = c + dc;
      if (
        nr < 0 ||
        nr >= rows ||
        nc < 0 ||
        nc >= cols ||
        vis[nr][nc] ||
        grid[nr][nc] === "wall"
      )
        continue;
      const cost = grid[nr][nc] === "weight" ? 3 : 1;
      const nd = d + cost;
      if (nd < dist[nr][nc]) {
        dist[nr][nc] = nd;
        parent[nr][nc] = [r, c];
        frontierCount++;
        pq.push([nd, nr, nc]);
        yield {
          type: "frontier",
          r: nr,
          c: nc,
          gCost: nd,
          hCost: 0,
          fCost: nd,
          visited,
          frontier: frontierCount,
          narrate: `Updated dist to (${nr},${nc}) = ${nd}.`,
        };
      }
    }
  }
  yield {
    type: "done",
    found: false,
    visited,
    frontier: frontierCount,
    narrate: "No path exists.",
  };
}

export function* bfs(grid, start, end) {
  const rows = grid.length,
    cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
  const q = [start];
  visited[start[0]][start[1]] = true;
  let visitCount = 0,
    frontierCount = 0;

  while (q.length) {
    const [r, c] = q.shift();
    visitCount++;
    yield {
      type: "visit",
      r,
      c,
      gCost: 0,
      hCost: 0,
      fCost: 0,
      visited: visitCount,
      frontier: frontierCount,
      narrate: `BFS visiting (${r},${c}). Explores level by level — all neighbors at distance D before distance D+1.`,
    };

    if (r === end[0] && c === end[1]) {
      const path = [];
      let cur = [r, c];
      while (cur) {
        path.unshift(cur);
        cur = parent[cur[0]][cur[1]];
      }
      for (const [pr, pc] of path)
        yield {
          type: "path",
          r: pr,
          c: pc,
          visited: visitCount,
          frontier: frontierCount,
          narrate:
            "Tracing shortest path (BFS guarantees shortest on unweighted grid).",
        };
      yield {
        type: "done",
        found: true,
        pathLen: path.length,
        visited: visitCount,
        frontier: frontierCount,
        narrate: `Shortest path found! Length: ${path.length}. BFS guarantees optimality on unweighted grids.`,
      };
      return;
    }
    for (const [dr, dc] of DIRS) {
      const nr = r + dr,
        nc = c + dc;
      if (
        nr < 0 ||
        nr >= rows ||
        nc < 0 ||
        nc >= cols ||
        visited[nr][nc] ||
        grid[nr][nc] === "wall"
      )
        continue;
      visited[nr][nc] = true;
      parent[nr][nc] = [r, c];
      frontierCount++;
      q.push([nr, nc]);
      yield {
        type: "frontier",
        r: nr,
        c: nc,
        gCost: 0,
        hCost: 0,
        fCost: 0,
        visited: visitCount,
        frontier: frontierCount,
        narrate: `Added (${nr},${nc}) to BFS queue. It will be processed after all closer cells.`,
      };
    }
  }
  yield {
    type: "done",
    found: false,
    visited: visitCount,
    frontier: frontierCount,
    narrate: "No path — BFS exhausted all reachable cells.",
  };
}

export function* dfs(grid, start, end) {
  const rows = grid.length,
    cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
  const stack = [start];
  let visitCount = 0,
    frontierCount = 0;

  while (stack.length) {
    const [r, c] = stack.pop();
    if (visited[r][c]) continue;
    visited[r][c] = true;
    visitCount++;
    yield {
      type: "visit",
      r,
      c,
      gCost: 0,
      hCost: 0,
      fCost: 0,
      visited: visitCount,
      frontier: frontierCount,
      narrate: `DFS diving into (${r},${c}). Goes deep before backtracking — may miss shorter paths.`,
    };

    if (r === end[0] && c === end[1]) {
      const path = [];
      let cur = [r, c];
      while (cur) {
        path.unshift(cur);
        cur = parent[cur[0]][cur[1]];
      }
      for (const [pr, pc] of path)
        yield {
          type: "path",
          r: pr,
          c: pc,
          visited: visitCount,
          frontier: frontierCount,
          narrate: "Tracing path found by DFS — not guaranteed shortest!",
        };
      yield {
        type: "done",
        found: true,
        pathLen: path.length,
        visited: visitCount,
        frontier: frontierCount,
        narrate: `Path found (length: ${path.length}) — but DFS does NOT guarantee shortest path!`,
      };
      return;
    }
    for (const [dr, dc] of [...DIRS].reverse()) {
      const nr = r + dr,
        nc = c + dc;
      if (
        nr < 0 ||
        nr >= rows ||
        nc < 0 ||
        nc >= cols ||
        visited[nr][nc] ||
        grid[nr][nc] === "wall"
      )
        continue;
      parent[nr][nc] = [r, c];
      frontierCount++;
      stack.push([nr, nc]);
      yield {
        type: "frontier",
        r: nr,
        c: nc,
        gCost: 0,
        hCost: 0,
        fCost: 0,
        visited: visitCount,
        frontier: frontierCount,
        narrate: `Pushed (${nr},${nc}) to stack. DFS will explore this next (LIFO order).`,
      };
    }
  }
  yield {
    type: "done",
    found: false,
    visited: visitCount,
    frontier: frontierCount,
    narrate: "No path found.",
  };
}

export function* greedy(grid, start, end) {
  const h = HEURISTICS.manhattan;
  const rows = grid.length,
    cols = grid[0].length;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent = Array.from({ length: rows }, () => Array(cols).fill(null));
  const open = [[h(start[0], start[1], end[0], end[1]), start[0], start[1]]];
  let visitCount = 0,
    frontierCount = 0;

  while (open.length) {
    open.sort((a, b) => a[0] - b[0]);
    const [hv, r, c] = open.shift();
    if (visited[r][c]) continue;
    visited[r][c] = true;
    visitCount++;
    yield {
      type: "visit",
      r,
      c,
      gCost: 0,
      hCost: hv,
      fCost: hv,
      visited: visitCount,
      frontier: frontierCount,
      narrate: `Greedy visiting (${r},${c}) — h=${hv}. Only looks at estimated distance to goal, ignores actual cost so far!`,
    };

    if (r === end[0] && c === end[1]) {
      const path = [];
      let cur = [r, c];
      while (cur) {
        path.unshift(cur);
        cur = parent[cur[0]][cur[1]];
      }
      for (const [pr, pc] of path)
        yield {
          type: "path",
          r: pr,
          c: pc,
          visited: visitCount,
          frontier: frontierCount,
          narrate: "Greedy path — fast but NOT optimal.",
        };
      yield {
        type: "done",
        found: true,
        pathLen: path.length,
        visited: visitCount,
        frontier: frontierCount,
        narrate: `Done! Greedy is fast (${visitCount} cells) but the path may NOT be shortest. Compare with A*!`,
      };
      return;
    }
    for (const [dr, dc] of DIRS) {
      const nr = r + dr,
        nc = c + dc;
      if (
        nr < 0 ||
        nr >= rows ||
        nc < 0 ||
        nc >= cols ||
        visited[nr][nc] ||
        grid[nr][nc] === "wall"
      )
        continue;
      parent[nr][nc] = [r, c];
      frontierCount++;
      open.push([h(nr, nc, end[0], end[1]), nr, nc]);
      yield {
        type: "frontier",
        r: nr,
        c: nc,
        gCost: 0,
        hCost: h(nr, nc, end[0], end[1]),
        fCost: h(nr, nc, end[0], end[1]),
        visited: visitCount,
        frontier: frontierCount,
        narrate: `Added (${nr},${nc}) h=${h(nr, nc, end[0], end[1])} — closest to goal wins.`,
      };
    }
  }
  yield {
    type: "done",
    found: false,
    visited: visitCount,
    frontier: frontierCount,
    narrate: "No path found.",
  };
}

export function* bidirectionalBFS(grid, start, end) {
  const rows = grid.length,
    cols = grid[0].length;
  const visF = Array.from({ length: rows }, () => Array(cols).fill(false));
  const visB = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parF = Array.from({ length: rows }, () => Array(cols).fill(null));
  const parB = Array.from({ length: rows }, () => Array(cols).fill(null));
  visF[start[0]][start[1]] = true;
  visB[end[0]][end[1]] = true;
  let qF = [start],
    qB = [end];
  let visitCount = 0,
    frontierCount = 0,
    meet = null;

  while (qF.length && qB.length && !meet) {
    // Forward step
    const nextF = [];
    for (const [r, c] of qF) {
      visitCount++;
      yield {
        type: "visit",
        r,
        c,
        side: "forward",
        visited: visitCount,
        frontier: frontierCount,
        narrate: `Forward BFS from start visiting (${r},${c}).`,
      };
      if (visB[r][c]) {
        meet = [r, c];
        break;
      }
      for (const [dr, dc] of DIRS) {
        const nr = r + dr,
          nc = c + dc;
        if (
          nr < 0 ||
          nr >= rows ||
          nc < 0 ||
          nc >= cols ||
          visF[nr][nc] ||
          grid[nr][nc] === "wall"
        )
          continue;
        visF[nr][nc] = true;
        parF[nr][nc] = [r, c];
        frontierCount++;
        nextF.push([nr, nc]);
        yield {
          type: "frontier",
          r: nr,
          c: nc,
          side: "forward",
          visited: visitCount,
          frontier: frontierCount,
          narrate: `Forward frontier: (${nr},${nc}).`,
        };
      }
    }
    if (meet) break;
    qF = nextF;

    // Backward step
    const nextB = [];
    for (const [r, c] of qB) {
      visitCount++;
      yield {
        type: "visit",
        r,
        c,
        side: "backward",
        visited: visitCount,
        frontier: frontierCount,
        narrate: `Backward BFS from goal visiting (${r},${c}).`,
      };
      if (visF[r][c]) {
        meet = [r, c];
        break;
      }
      for (const [dr, dc] of DIRS) {
        const nr = r + dr,
          nc = c + dc;
        if (
          nr < 0 ||
          nr >= rows ||
          nc < 0 ||
          nc >= cols ||
          visB[nr][nc] ||
          grid[nr][nc] === "wall"
        )
          continue;
        visB[nr][nc] = true;
        parB[nr][nc] = [r, c];
        frontierCount++;
        nextB.push([nr, nc]);
        yield {
          type: "frontier",
          r: nr,
          c: nc,
          side: "backward",
          visited: visitCount,
          frontier: frontierCount,
          narrate: `Backward frontier: (${nr},${nc}).`,
        };
      }
    }
    if (meet) break;
    qB = nextB;
  }

  if (meet) {
    const pathF = [],
      pathB = [];
    let cur = meet;
    while (cur) {
      pathF.unshift(cur);
      cur = parF[cur[0]][cur[1]];
    }
    cur = parB[meet[0]][meet[1]];
    while (cur) {
      pathB.push(cur);
      cur = parB[cur[0]][cur[1]];
    }
    const path = [...pathF, ...pathB];
    for (const [pr, pc] of path)
      yield {
        type: "path",
        r: pr,
        c: pc,
        visited: visitCount,
        frontier: frontierCount,
        narrate: "Stitching forward + backward paths at meeting point!",
      };
    yield {
      type: "done",
      found: true,
      pathLen: path.length,
      visited: visitCount,
      frontier: frontierCount,
      narrate: `Bidirectional BFS met at (${meet[0]},${meet[1]})! Only explored ~${visitCount} cells — roughly half of regular BFS!`,
    };
  } else {
    yield {
      type: "done",
      found: false,
      visited: visitCount,
      frontier: frontierCount,
      narrate: "No path found.",
    };
  }
}

export const PATH_ALGOS = {
  astar: {
    label: "A*",
    fn: astar,
    complexity: { avg: "O(E log V)", best: "O(1)", space: "O(V)" },
    why: "Best general pathfinder. Used in games, GPS, robotics. Optimal AND fast thanks to the heuristic.",
    info: "Uses f(n) = g(n) + h(n). g = actual cost from start, h = estimated cost to goal. Always expands the most promising node.",
    heuristicToggle: true,
    code: {
      js: `function astar(grid, start, end) {\n  const h = manhattan; // heuristic\n  const open = new PriorityQueue();\n  const g = {}; g[start] = 0;\n  open.push([h(start,end), start]);\n  const parent = {};\n\n  while (!open.empty()) {\n    const [_, cur] = open.pop();\n    if (cur === end) return reconstructPath(parent, end);\n    for (const neighbor of getNeighbors(grid, cur)) {\n      const ng = g[cur] + cost(neighbor);\n      if (ng < (g[neighbor] ?? Infinity)) {\n        g[neighbor] = ng;\n        parent[neighbor] = cur;\n        open.push([ng + h(neighbor,end), neighbor]);\n      }\n    }\n  }\n}`,
      py: `def astar(grid, start, end):\n    h = manhattan  # heuristic\n    open_set = [(h(start, end), start)]\n    g = {start: 0}\n    parent = {}\n    while open_set:\n        _, cur = heappop(open_set)\n        if cur == end:\n            return reconstruct(parent, end)\n        for nb in neighbors(grid, cur):\n            ng = g[cur] + cost(nb)\n            if ng < g.get(nb, float('inf')):\n                g[nb] = ng\n                parent[nb] = cur\n                heappush(open_set, (ng + h(nb, end), nb))`,
    },
  },
  dijkstra: {
    label: "Dijkstra",
    fn: dijkstra,
    complexity: { avg: "O(V²)", best: "O(1)", space: "O(V)" },
    why: "Shortest path on weighted graphs. GPS navigation, network routing. A* without the heuristic.",
    info: "Always processes the globally closest unvisited node. Explores in all directions equally — great for weighted graphs.",
    code: {
      js: `function dijkstra(grid, start, end) {\n  const dist = {}; dist[start] = 0;\n  const pq = new PriorityQueue();\n  pq.push([0, start]);\n  const parent = {};\n\n  while (!pq.empty()) {\n    const [d, cur] = pq.pop();\n    if (cur === end) return reconstructPath(parent, end);\n    for (const nb of neighbors(grid, cur)) {\n      const nd = d + weight(nb);\n      if (nd < (dist[nb] ?? Infinity)) {\n        dist[nb] = nd;\n        parent[nb] = cur;\n        pq.push([nd, nb]);\n      }\n    }\n  }\n}`,
      py: `def dijkstra(grid, start, end):\n    dist = {start: 0}\n    pq = [(0, start)]\n    parent = {}\n    while pq:\n        d, cur = heappop(pq)\n        if cur == end:\n            return reconstruct(parent, end)\n        for nb in neighbors(grid, cur):\n            nd = d + weight(nb)\n            if nd < dist.get(nb, float('inf')):\n                dist[nb] = nd\n                parent[nb] = cur\n                heappush(pq, (nd, nb))`,
    },
  },
  bfs: {
    label: "BFS",
    fn: bfs,
    complexity: { avg: "O(V+E)", best: "O(1)", space: "O(V)" },
    why: "Shortest path on unweighted graphs. Simple, reliable, guaranteed optimal.",
    info: "Explores level by level — all cells at distance 1, then 2, etc. Queue (FIFO) ensures shortest path on uniform-cost grids.",
    code: {
      js: `function bfs(grid, start, end) {\n  const queue = [start];\n  const visited = new Set([start]);\n  const parent = {};\n\n  while (queue.length) {\n    const cur = queue.shift();\n    if (cur === end) return reconstructPath(parent, end);\n    for (const nb of neighbors(grid, cur)) {\n      if (!visited.has(nb) && grid[nb] !== 'wall') {\n        visited.add(nb);\n        parent[nb] = cur;\n        queue.push(nb);\n      }\n    }\n  }\n}`,
      py: `def bfs(grid, start, end):\n    from collections import deque\n    queue = deque([start])\n    visited = {start}\n    parent = {}\n    while queue:\n        cur = queue.popleft()\n        if cur == end:\n            return reconstruct(parent, end)\n        for nb in neighbors(grid, cur):\n            if nb not in visited and grid[nb] != 'wall':\n                visited.add(nb)\n                parent[nb] = cur\n                queue.append(nb)`,
    },
  },
  dfs: {
    label: "DFS",
    fn: dfs,
    complexity: { avg: "O(V+E)", best: "O(1)", space: "O(V)" },
    why: "Maze solving, cycle detection, topological sort. Not for shortest path.",
    info: "Dives as deep as possible along one branch before backtracking. Stack (LIFO) gives depth-first behavior.",
    code: {
      js: `function dfs(grid, start, end) {\n  const stack = [start];\n  const visited = new Set();\n  const parent = {};\n\n  while (stack.length) {\n    const cur = stack.pop();\n    if (visited.has(cur)) continue;\n    visited.add(cur);\n    if (cur === end) return reconstructPath(parent, end);\n    for (const nb of neighbors(grid, cur)) {\n      if (!visited.has(nb) && grid[nb] !== 'wall') {\n        parent[nb] = cur;\n        stack.push(nb);\n      }\n    }\n  }\n}`,
      py: `def dfs(grid, start, end):\n    stack = [start]\n    visited = set()\n    parent = {}\n    while stack:\n        cur = stack.pop()\n        if cur in visited: continue\n        visited.add(cur)\n        if cur == end:\n            return reconstruct(parent, end)\n        for nb in neighbors(grid, cur):\n            if nb not in visited and grid[nb] != 'wall':\n                parent[nb] = cur\n                stack.append(nb)`,
    },
  },
  greedy: {
    label: "Greedy BFS",
    fn: greedy,
    complexity: { avg: "O(E log V)", best: "O(1)", space: "O(V)" },
    why: "Fastest to find some path — but sacrifices optimality. Great to contrast with A*.",
    info: "Only uses h(n) — estimated distance to goal. Ignores actual cost. Faster than A* but may find suboptimal paths.",
    code: {
      js: `function greedyBFS(grid, start, end) {\n  const h = manhattan;\n  const open = new PriorityQueue();\n  open.push([h(start,end), start]);\n  const visited = new Set([start]);\n  const parent = {};\n\n  while (!open.empty()) {\n    const [_, cur] = open.pop();\n    if (cur === end) return reconstructPath(parent, end);\n    for (const nb of neighbors(grid, cur)) {\n      if (!visited.has(nb) && grid[nb] !== 'wall') {\n        visited.add(nb);\n        parent[nb] = cur;\n        open.push([h(nb, end), nb]);\n      }\n    }\n  }\n}`,
      py: `def greedy_bfs(grid, start, end):\n    h = manhattan\n    open_set = [(h(start, end), start)]\n    visited = {start}\n    parent = {}\n    while open_set:\n        _, cur = heappop(open_set)\n        if cur == end:\n            return reconstruct(parent, end)\n        for nb in neighbors(grid, cur):\n            if nb not in visited and grid[nb] != 'wall':\n                visited.add(nb)\n                parent[nb] = cur\n                heappush(open_set, (h(nb, end), nb))`,
    },
  },
  bidir: {
    label: "Bidirectional",
    fn: bidirectionalBFS,
    complexity: { avg: "O(b^(d/2))", best: "O(1)", space: "O(b^(d/2))" },
    why: "Searches from both ends simultaneously — explores roughly √(nodes) compared to regular BFS!",
    info: "Runs two BFS simultaneously — one from start, one from end. Terminates when they meet. Dramatic speedup on large grids.",
    code: {
      js: `function bidirectionalBFS(grid, start, end) {\n  let qF = [start], qB = [end];\n  const visF = new Set([start]);\n  const visB = new Set([end]);\n  const parF = {}, parB = {};\n\n  while (qF.length && qB.length) {\n    expand(qF, visF, visB, parF, grid);\n    expand(qB, visB, visF, parB, grid);\n    const meet = findMeeting(visF, visB);\n    if (meet) return stitchPath(parF, parB, meet);\n  }\n}`,
      py: `def bidirectional_bfs(grid, start, end):\n    qF, qB = deque([start]), deque([end])\n    visF, visB = {start}, {end}\n    parF, parB = {}, {}\n    while qF and qB:\n        expand(qF, visF, visB, parF, grid)\n        expand(qB, visB, visF, parB, grid)\n        if meet := find_meeting(visF, visB):\n            return stitch_path(parF, parB, meet)`,
    },
  },
};
