/* eslint-disable @typescript-eslint/no-explicit-any */

import type { GraphData } from "../../components/Graph/presets";

/* ---- Kruskal's MST ---- */

export function* kruskalMST(graph: GraphData) {
  const edges = graph.edges
    .filter((e) => e.weight !== undefined)
    .map((e) => ({ ...e }))
    .sort((a, b) => a.weight! - b.weight!);

  const parent: Record<string, string> = {};
  const rank: Record<string, number> = {};
  for (const n of graph.nodes) {
    parent[n.id] = n.id;
    rank[n.id] = 0;
  }

  function find(x: string): string {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  function union(a: string, b: string) {
    const ra = find(a),
      rb = find(b);
    if (ra === rb) return false;
    if (rank[ra] < rank[rb]) parent[ra] = rb;
    else if (rank[ra] > rank[rb]) parent[rb] = ra;
    else {
      parent[rb] = ra;
      rank[ra]++;
    }
    return true;
  }

  let processed = 0,
    mstWeight = 0,
    mstEdges = 0;

  yield {
    type: "visit-node",
    nodeId: graph.nodes[0].id,
    narrate: `Kruskal's: sort all ${edges.length} edges by weight, then greedily add cheapest that doesn't form a cycle.`,
    line: { js: 1, py: 1 },
    edgesProcessed: 0,
    mstWeight: 0,
    mstEdges: 0,
  };

  for (const e of edges) {
    processed++;
    yield {
      type: "consider-edge",
      from: e.from,
      to: e.to,
      narrate: `Considering edge ${e.from}-${e.to} (weight ${e.weight}). Do ${e.from} and ${e.to} belong to different components?`,
      line: { js: 7, py: 7 },
      edgesProcessed: processed,
      mstWeight,
      mstEdges,
    };

    if (union(e.from, e.to)) {
      mstWeight += e.weight!;
      mstEdges++;
      yield {
        type: "add-edge",
        from: e.from,
        to: e.to,
        narrate: `Yes! Different components — add edge ${e.from}-${e.to} (weight ${e.weight}). MST weight = ${mstWeight}.`,
        line: { js: 9, py: 9 },
        edgesProcessed: processed,
        mstWeight,
        mstEdges,
      };
    } else {
      yield {
        type: "reject-edge",
        from: e.from,
        to: e.to,
        narrate: `No — ${e.from} and ${e.to} are already connected. Adding this edge would create a cycle. Skip.`,
        line: { js: 11, py: 11 },
        edgesProcessed: processed,
        mstWeight,
        mstEdges,
      };
    }
  }

  yield {
    type: "done",
    narrate: `Done! MST has ${mstEdges} edges with total weight ${mstWeight}. Kruskal's always finds the minimum spanning tree.`,
    edgesProcessed: processed,
    mstWeight,
    mstEdges,
  };
}

/* ---- Prim's MST ---- */

export function* primMST(graph: GraphData) {
  const adj: Record<string, { to: string; weight: number }[]> = {};
  for (const n of graph.nodes) adj[n.id] = [];
  for (const e of graph.edges) {
    if (e.weight === undefined) continue;
    adj[e.from].push({ to: e.to, weight: e.weight });
    adj[e.to].push({ to: e.from, weight: e.weight });
  }

  const inMST = new Set<string>();
  const start = graph.nodes[0].id;
  inMST.add(start);

  let mstWeight = 0,
    mstEdges = 0,
    processed = 0;

  yield {
    type: "visit-node",
    nodeId: start,
    narrate: `Prim's: start from node ${start}. Grow the MST by always adding the cheapest edge that connects a new node.`,
    line: { js: 3, py: 3 },
    edgesProcessed: 0,
    mstWeight: 0,
    mstEdges: 0,
  };

  while (inMST.size < graph.nodes.length) {
    let best: { from: string; to: string; weight: number } | null = null;

    for (const u of inMST) {
      for (const { to, weight } of adj[u]) {
        if (inMST.has(to)) continue;
        processed++;
        yield {
          type: "consider-edge",
          from: u,
          to,
          narrate: `Checking edge ${u}-${to} (weight ${weight}). ${best ? `Current best: ${best.weight}` : "First candidate."}.`,
          line: { js: 7, py: 7 },
          edgesProcessed: processed,
          mstWeight,
          mstEdges,
        };
        if (!best || weight < best.weight) {
          best = { from: u, to, weight };
        }
      }
    }

    if (!best) break;

    inMST.add(best.to);
    mstWeight += best.weight;
    mstEdges++;

    yield {
      type: "visit-node",
      nodeId: best.to,
      narrate: `Node ${best.to} joins the MST (${inMST.size}/${graph.nodes.length} nodes).`,
      line: { js: 10, py: 10 },
      edgesProcessed: processed,
      mstWeight,
      mstEdges,
    };

    yield {
      type: "add-edge",
      from: best.from,
      to: best.to,
      narrate: `Cheapest crossing edge: ${best.from}-${best.to} (weight ${best.weight}). Total weight = ${mstWeight}.`,
      line: { js: 11, py: 11 },
      edgesProcessed: processed,
      mstWeight,
      mstEdges,
    };
  }

  yield {
    type: "done",
    narrate: `Done! MST has ${mstEdges} edges with total weight ${mstWeight}. Prim's grows the tree one node at a time.`,
    edgesProcessed: processed,
    mstWeight,
    mstEdges,
  };
}

/* ---- Topological Sort (Kahn's BFS) ---- */

export function* topoSort(graph: GraphData) {
  const inDeg: Record<string, number> = {};
  const adj: Record<string, string[]> = {};
  for (const n of graph.nodes) {
    inDeg[n.id] = 0;
    adj[n.id] = [];
  }
  for (const e of graph.edges) {
    adj[e.from].push(e.to);
    inDeg[e.to]++;
  }

  const queue: string[] = [];
  for (const n of graph.nodes) {
    if (inDeg[n.id] === 0) queue.push(n.id);
  }

  const order: string[] = [];
  let processed = 0;

  yield {
    type: "visit-node",
    nodeId: queue[0] || graph.nodes[0].id,
    narrate: `Kahn's algorithm: nodes with in-degree 0 → queue: [${queue.join(", ")}]. Process one at a time.`,
    line: { js: 5, py: 5 },
    edgesProcessed: 0,
    mstWeight: 0,
    mstEdges: order.length,
  };

  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    processed++;

    yield {
      type: "add-to-order",
      nodeId: u,
      narrate: `Dequeue ${u} → add to topological order (position ${order.length}). Now reduce in-degrees of its neighbors.`,
      line: { js: 7, py: 7 },
      edgesProcessed: processed,
      mstWeight: 0,
      mstEdges: order.length,
    };

    for (const v of adj[u]) {
      inDeg[v]--;

      yield {
        type: "consider-edge",
        from: u,
        to: v,
        narrate: `Edge ${u}→${v}: reduce in-degree of ${v} to ${inDeg[v]}.${inDeg[v] === 0 ? ` Now 0 — add ${v} to queue!` : ""}`,
        line: { js: 9, py: 9 },
        edgesProcessed: processed,
        mstWeight: 0,
        mstEdges: order.length,
      };

      if (inDeg[v] === 0) {
        queue.push(v);
        yield {
          type: "visit-node",
          nodeId: v,
          narrate: `${v} has in-degree 0 — ready to be processed. Added to queue.`,
          line: { js: 10, py: 10 },
          edgesProcessed: processed,
          mstWeight: 0,
          mstEdges: order.length,
        };
      }
    }
  }

  const valid = order.length === graph.nodes.length;

  yield {
    type: "done",
    narrate: valid
      ? `Done! Topological order: ${order.join(" → ")}. All ${order.length} nodes processed — valid DAG.`
      : `Stopped after ${order.length}/${graph.nodes.length} nodes — cycle detected! Not a DAG.`,
    edgesProcessed: processed,
    mstWeight: 0,
    mstEdges: order.length,
  };
}

/* ---- Cycle Detection (DFS coloring) ---- */

export function* cycleDetection(graph: GraphData): Generator<any> {
  const adj: Record<string, string[]> = {};
  for (const n of graph.nodes) adj[n.id] = [];
  for (const e of graph.edges) {
    adj[e.from].push(e.to);
  }

  const color: Record<string, "white" | "gray" | "black"> = {};
  for (const n of graph.nodes) color[n.id] = "white";

  let visited = 0;
  let cycleFound = false;

  function* dfs(u: string): Generator<any> {
    color[u] = "gray";
    visited++;

    yield {
      type: "visit-node",
      nodeId: u,
      narrate: `Visit ${u} — mark GRAY (in progress). Exploring its neighbors...`,
      line: { js: 4, py: 4 },
      edgesProcessed: visited,
      mstWeight: 0,
      mstEdges: 0,
    };

    for (const v of adj[u]) {
      yield {
        type: "consider-edge",
        from: u,
        to: v,
        narrate: `Edge ${u}→${v}: neighbor ${v} is ${color[v].toUpperCase()}.${color[v] === "gray" ? " BACK EDGE — cycle found!" : ""}`,
        line: { js: 6, py: 6 },
        edgesProcessed: visited,
        mstWeight: 0,
        mstEdges: 0,
      };

      if (color[v] === "gray") {
        cycleFound = true;
        yield {
          type: "cycle-found",
          from: u,
          to: v,
          narrate: `Cycle detected! ${u}→${v} is a back edge — ${v} is still being processed (GRAY). The graph has a cycle.`,
          line: { js: 7, py: 7 },
          edgesProcessed: visited,
          mstWeight: 0,
          mstEdges: 0,
        };
        return;
      }

      if (color[v] === "white") {
        yield* dfs(v);
        if (cycleFound) return;
      }
    }

    color[u] = "black";
    yield {
      type: "finish-node",
      nodeId: u,
      narrate: `All neighbors of ${u} explored — mark BLACK (done). Backtrack.`,
      line: { js: 10, py: 10 },
      edgesProcessed: visited,
      mstWeight: 0,
      mstEdges: 0,
    };
  }

  for (const n of graph.nodes) {
    if (color[n.id] === "white") {
      yield* dfs(n.id);
      if (cycleFound) break;
    }
  }

  yield {
    type: "done",
    narrate: cycleFound
      ? `Done — cycle detected! The directed graph contains at least one cycle.`
      : `Done — no cycle found. This is a DAG (Directed Acyclic Graph). ${visited} nodes visited.`,
    edgesProcessed: visited,
    mstWeight: 0,
    mstEdges: 0,
  };
}

/* ---- GRAPH_ALGOS config ---- */

export const GRAPH_ALGOS: Record<string, any> = {
  kruskal: {
    label: "Kruskal's MST",
    fn: kruskalMST,
    complexity: { avg: "O(E log E)", best: "O(E log E)", space: "O(V)" },
    info: "Sort all edges by weight. Greedily add the cheapest edge that doesn't form a cycle, using Union-Find to track components.",
    why: "Finds minimum spanning tree. Great when you have a sparse graph or already have edges in a list.",
    code: {
      js: `function kruskal(nodes, edges) {\n  edges.sort((a, b) => a.w - b.w);\n  const parent = {};\n  nodes.forEach(n => parent[n] = n);\n  const find = x => parent[x] === x ? x : (parent[x] = find(parent[x]));\n  const union = (a, b) => { parent[find(a)] = find(b); };\n  const mst = [];\n  for (const {u, v, w} of edges) {\n    if (find(u) !== find(v)) {\n      mst.push({u, v, w});\n      union(u, v);\n    }\n  }\n  return mst;\n}`,
      py: `def kruskal(nodes, edges):\n    edges.sort(key=lambda e: e[2])\n    parent = {n: n for n in nodes}\n    def find(x):\n        if parent[x] != x: parent[x] = find(parent[x])\n        return parent[x]\n    def union(a, b): parent[find(a)] = find(b)\n    mst = []\n    for u, v, w in edges:\n        if find(u) != find(v):\n            mst.append((u, v, w))\n            union(u, v)\n    return mst`,
    },
  },
  prim: {
    label: "Prim's MST",
    fn: primMST,
    complexity: { avg: "O(E log V)", best: "O(E log V)", space: "O(V)" },
    info: "Start from any node. Always add the cheapest edge that connects a new node to the growing tree.",
    why: "Finds minimum spanning tree. Better than Kruskal's for dense graphs. Used in network design.",
    code: {
      js: `function prim(adj, start) {\n  const inMST = new Set([start]);\n  const mst = [];\n  while (inMST.size < adj.size) {\n    let best = null;\n    for (const u of inMST)\n      for (const {to, w} of adj[u])\n        if (!inMST.has(to) && (!best || w < best.w))\n          best = {u, to, w};\n    if (!best) break;\n    mst.push(best);\n    inMST.add(best.to);\n  }\n  return mst;\n}`,
      py: `def prim(adj, start):\n    in_mst = {start}\n    mst = []\n    while len(in_mst) < len(adj):\n        best = None\n        for u in in_mst:\n            for to, w in adj[u]:\n                if to not in in_mst:\n                    if not best or w < best[2]:\n                        best = (u, to, w)\n        if not best: break\n        mst.append(best)\n        in_mst.add(best[1])\n    return mst`,
    },
  },
  topo: {
    label: "Topological Sort",
    fn: topoSort,
    complexity: { avg: "O(V + E)", best: "O(V + E)", space: "O(V)" },
    info: "Order nodes so every edge points forward. Uses Kahn's algorithm: repeatedly remove nodes with no incoming edges.",
    why: "Used for task scheduling, build systems, course prerequisites — anywhere you need dependency ordering.",
    code: {
      js: `function topoSort(nodes, edges) {\n  const inDeg = {}, adj = {};\n  nodes.forEach(n => { inDeg[n] = 0; adj[n] = []; });\n  edges.forEach(([u, v]) => { adj[u].push(v); inDeg[v]++; });\n  const queue = nodes.filter(n => inDeg[n] === 0);\n  const order = [];\n  while (queue.length) {\n    const u = queue.shift();\n    order.push(u);\n    for (const v of adj[u])\n      if (--inDeg[v] === 0) queue.push(v);\n  }\n  return order;\n}`,
      py: `def topo_sort(nodes, edges):\n    in_deg = {n: 0 for n in nodes}\n    adj = {n: [] for n in nodes}\n    for u, v in edges:\n        adj[u].append(v)\n        in_deg[v] += 1\n    queue = [n for n in nodes if in_deg[n] == 0]\n    order = []\n    while queue:\n        u = queue.pop(0)\n        order.append(u)\n        for v in adj[u]:\n            in_deg[v] -= 1\n            if in_deg[v] == 0: queue.append(v)\n    return order`,
    },
  },
  cycleDetect: {
    label: "Cycle Detection",
    fn: cycleDetection,
    complexity: { avg: "O(V + E)", best: "O(V + E)", space: "O(V)" },
    info: "DFS with three colors: WHITE (unvisited), GRAY (in progress), BLACK (done). A back edge to a GRAY node means cycle.",
    why: "Detect circular dependencies, deadlocks, or validate that a graph is a DAG before topological sorting.",
    code: {
      js: `function hasCycle(nodes, adj) {\n  const color = {};\n  nodes.forEach(n => color[n] = 'white');\n  function dfs(u) {\n    color[u] = 'gray';\n    for (const v of adj[u]) {\n      if (color[v] === 'gray') return true;\n      if (color[v] === 'white' && dfs(v)) return true;\n    }\n    color[u] = 'black';\n    return false;\n  }\n  return nodes.some(n => color[n] === 'white' && dfs(n));\n}`,
      py: `def has_cycle(nodes, adj):\n    color = {n: 'white' for n in nodes}\n    def dfs(u):\n        color[u] = 'gray'\n        for v in adj[u]:\n            if color[v] == 'gray': return True\n            if color[v] == 'white' and dfs(v): return True\n        color[u] = 'black'\n        return False\n    return any(\n        color[n] == 'white' and dfs(n)\n        for n in nodes\n    )`,
    },
  },
};
