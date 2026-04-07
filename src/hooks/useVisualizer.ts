/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useRef } from "react";
import { useStore } from "../store";
import { SORT_ALGOS } from "../algorithms/sorting";
import { PATH_ALGOS } from "../algorithms/pathfinding";
import { GRAPH_ALGOS } from "../algorithms/graph";
import { TREE_ALGOS, buildTreeLayout } from "../algorithms/tree";
import { defaultPresetForAlgo } from "../components/Graph/presets";
import { defaultInputForAlgo } from "../components/Tree/presets";
import { GRID_COLS_N, GRID_ROWS_N } from "../constants";

/* ---------- types ---------- */

type SortStep = {
  type: string;
  i?: number;
  j?: number;
  idx?: number;
  arr: number[];
  comps?: number;
  swaps?: number;
  passes?: number;
  line?: { js: number; py: number };
  narrate?: string;
};

type PathStep = {
  type: string;
  r: number;
  c: number;
  visited?: number;
  frontier?: number;
  pathLen?: number;
  narrate?: string;
  heatmap?: number[][];
  gCost?: number;
  hCost?: number;
  fCost?: number;
};

type GraphStep = {
  type: string;
  nodeId?: string;
  from?: string;
  to?: string;
  narrate?: string;
  line?: { js: number; py: number };
  edgesProcessed?: number;
  mstWeight?: number;
  mstEdges?: number;
};

type TreeStep = {
  type: string;
  tree?: any;
  nodeId?: string;
  targetId?: string;
  narrate?: string;
  line?: { js: number; py: number };
  comparisons?: number;
  insertions?: number;
};

type ColorsRef = { current: string[] };
type GridColorsRef = { current: string[][] };

/* ---------- constants ---------- */

const COLORS = {
  idle: "#1e1e32",
  compare: "#7c6af7",
  swap: "#f7694a",
  sorted: "#22d3a5",
  pivot: "#f5a623",
  current: "#4a9eff",
  min: "#f4c0d1",
};

/* ---------- utils ---------- */

export function makeArr(n: number = 38): number[] {
  return Array.from({ length: n }, (_, i) => Math.round(((i + 1) / n) * 100));
}

export function shuffleArr(a: number[]): number[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/* ---------- hook ---------- */

export function useVisualizer() {
  const { state, dispatch, runRef, pauseRef, genRef } = useStore();
  const { algoKey, category, speed, grid, pathStart, pathEnd, heuristic } =
    state;

  const speedRef = useRef(speed);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const historyRef = useRef(state.history);
  const historyIdxRef = useRef(state.historyIdx);

  useEffect(() => {
    historyRef.current = state.history;
    historyIdxRef.current = state.historyIdx;
  }, [state.history, state.historyIdx]);

  const replayHistory = useCallback(
    async (startIdx: number, hist: any[]): Promise<boolean> => {
      for (let i = startIdx + 1; i < hist.length; i++) {
        if (!runRef.current) return false;
        while (pauseRef.current) await sleep(50);

        const entry = hist[i];
        const s = entry.snapshot || {};

        if (s.sortArr !== undefined) {
          dispatch({ type: "SET_SORT_ARR", payload: s.sortArr });
          dispatch({ type: "SET_SORT_COLORS", payload: s.sortColors });
          dispatch({ type: "SET_SORTED", payload: [...(s.sortedSet || [])] });
        }
        if (s.gridColors !== undefined) {
          dispatch({ type: "SET_GRID_COLORS", payload: s.gridColors });
          if (s.cellData)
            dispatch({ type: "SET_CELL_DATA", payload: s.cellData });
          if (s.heatmap !== undefined)
            dispatch({ type: "SET_HEATMAP", payload: s.heatmap });
        }
        if (s.graphNodeColors !== undefined) {
          dispatch({ type: "SET_GRAPH_NODE_COLORS", payload: s.graphNodeColors });
          dispatch({ type: "SET_GRAPH_EDGE_COLORS", payload: s.graphEdgeColors || {} });
        }
        if (s.treeNodeColors !== undefined) {
          if (s.treeData)
            dispatch({ type: "SET_TREE_DATA", payload: s.treeData });
          dispatch({ type: "SET_TREE_NODE_COLORS", payload: s.treeNodeColors });
          dispatch({ type: "SET_TREE_EDGE_COLORS", payload: s.treeEdgeColors || {} });
        }
        if (s.stats) dispatch({ type: "SET_STATS", payload: s.stats });
        if (s.activeLine)
          dispatch({ type: "SET_ACTIVE_LINE", payload: s.activeLine });
        dispatch({
          type: "SET_NARRATOR",
          payload: { step: entry.type, msg: entry.msg, why: "" },
        });
        dispatch({ type: "SET_HIST_IDX", payload: i });

        const d = Math.max(10, Math.round(200 / speedRef.current));
        await sleep(d);
      }
      return true;
    },
    [dispatch, runRef, pauseRef, speedRef],
  );

  const jumpToStep = useCallback(
    (idx: number) => {
      runRef.current = false;
      pauseRef.current = false;
      dispatch({ type: "JUMP_TO_STEP", payload: idx });
    },
    [dispatch, runRef, pauseRef],
  );

  /* ---------- SORT ---------- */

  const initSort = useCallback(
    (key: string = algoKey) => {
      runRef.current = false;
      genRef.current = null;

      const arr = shuffleArr(makeArr());

      dispatch({ type: "SET_SORT_ARR", payload: arr });
      dispatch({
        type: "SET_SORT_COLORS",
        payload: Array(arr.length).fill(COLORS.idle),
      });
      dispatch({ type: "SET_SORTED", payload: [] });
      dispatch({ type: "SET_ACTIVE_LINE", payload: { js: -1, py: -1 } });

      dispatch({
        type: "SET_STATS",
        payload: { comps: 0, swaps: 0, passes: 0 },
      });

      dispatch({ type: "SET", payload: { running: false, paused: false } });

      dispatch({
        type: "SET_NARRATOR",
        payload: {
          step: "ready",
          msg: `${SORT_ALGOS[key].label} Sort — array of ${arr.length} elements shuffled. Press Run or Step.`,
          why: SORT_ALGOS[key].why,
        },
      });

      dispatch({ type: "RESET_HISTORY" });
    },
    [algoKey, dispatch, genRef, runRef],
  );

  /* ---------- GRAPH ---------- */

  const initGraph = useCallback(
    (key: string = algoKey) => {
      runRef.current = false;
      genRef.current = null;

      const graphData = defaultPresetForAlgo(key);
      dispatch({ type: "SET_GRAPH_DATA", payload: graphData });
      dispatch({ type: "RESET_GRAPH_COLORS" });
      dispatch({ type: "SET_ACTIVE_LINE", payload: { js: -1, py: -1 } });

      dispatch({
        type: "SET_STATS",
        payload: {
          comps: 0,
          swaps: 0,
          passes: 0,
          visited: 0,
          frontier: 0,
          pathLen: 0,
        },
      });

      dispatch({ type: "SET", payload: { running: false, paused: false } });

      dispatch({
        type: "SET_NARRATOR",
        payload: {
          step: "ready",
          msg: `${GRAPH_ALGOS[key].label} — select a preset graph and press Run.`,
          why: GRAPH_ALGOS[key].why,
        },
      });

      dispatch({ type: "RESET_HISTORY" });
    },
    [algoKey, dispatch, genRef, runRef],
  );

  /* ---------- TREE ---------- */

  const initTree = useCallback(
    (key: string = algoKey) => {
      runRef.current = false;
      genRef.current = null;

      const input = defaultInputForAlgo(key);
      dispatch({ type: "SET_TREE_INPUT", payload: input });

      // For search/delete, show the pre-built tree
      if (key === "bstSearch" || key === "bstDelete" || key === "avlDelete") {
        dispatch({ type: "SET_TREE_DATA", payload: buildTreeLayout(input.values) });
      } else {
        dispatch({ type: "SET_TREE_DATA", payload: { nodes: [], edges: [] } });
      }

      dispatch({ type: "RESET_TREE_COLORS" });
      dispatch({ type: "SET_ACTIVE_LINE", payload: { js: -1, py: -1 } });

      dispatch({
        type: "SET_STATS",
        payload: { comps: 0, swaps: 0, passes: 0, visited: 0, frontier: 0, pathLen: 0 },
      });

      dispatch({ type: "SET", payload: { running: false, paused: false } });

      dispatch({
        type: "SET_NARRATOR",
        payload: {
          step: "ready",
          msg: `${TREE_ALGOS[key].label} — press Run to start.`,
          why: TREE_ALGOS[key].why,
        },
      });

      dispatch({ type: "RESET_HISTORY" });
    },
    [algoKey, dispatch, genRef, runRef],
  );

  const processSortStep = useCallback(
    async (
      step: SortStep,
      sortedSetRef: { current: Set<number> },
      colorsRef: ColorsRef,
    ): Promise<boolean> => {
      const d = Math.round(500 / speedRef.current);

      if (step.arr) {
        dispatch({ type: "SET_SORT_ARR", payload: [...step.arr] });
      }

      dispatch({
        type: "SET_STATS",
        payload: {
          comps: step.comps || 0,
          swaps: step.swaps || 0,
          passes: step.passes || 0,
        },
      });

      if (step.line !== undefined)
        dispatch({ type: "SET_ACTIVE_LINE", payload: step.line });

      if (step.narrate)
        dispatch({
          type: "SET_NARRATOR",
          payload: { step: step.type, msg: step.narrate, why: "" },
        });

      const cols = [...colorsRef.current];
      const sorted = new Set(sortedSetRef.current);

      if (step.type === "compare") {
        cols[step.i!] = COLORS.compare;
        cols[step.j!] = COLORS.compare;
        colorsRef.current = cols;
        dispatch({ type: "SET_SORT_COLORS", payload: [...cols] });
        await sleep(d);
      } else if (step.type === "swap") {
        cols[step.i!] = COLORS.swap;
        cols[step.j!] = COLORS.swap;
        colorsRef.current = cols;

        dispatch({ type: "SET_SORT_COLORS", payload: [...cols] });
        dispatch({ type: "SET_SORT_ARR", payload: [...step.arr] });

        await sleep(d);

        step.arr.forEach((_, idx) => {
          if (!sorted.has(idx) && idx !== step.i && idx !== step.j)
            cols[idx] = COLORS.idle;
        });

        colorsRef.current = cols;
        dispatch({ type: "SET_SORT_COLORS", payload: [...cols] });
      } else if (step.type === "sorted") {
        sorted.add(step.idx!);
        sortedSetRef.current = sorted;

        cols[step.idx!] = COLORS.sorted;
        colorsRef.current = cols;

        dispatch({ type: "SET_SORT_COLORS", payload: [...cols] });
        dispatch({ type: "SET_SORTED", payload: [...sorted] });
        dispatch({ type: "SET_SORT_ARR", payload: [...step.arr] });
      } else if (step.type === "pivot") {
        cols[step.idx!] = COLORS.pivot;
        colorsRef.current = cols;

        dispatch({ type: "SET_SORT_COLORS", payload: [...cols] });
        await sleep(d * 0.4);
      } else if (step.type === "current") {
        cols[step.idx!] = COLORS.current;
        colorsRef.current = cols;

        dispatch({ type: "SET_SORT_COLORS", payload: [...cols] });
        dispatch({ type: "SET_SORT_ARR", payload: [...step.arr] });

        await sleep(d * 0.3);
      } else if (step.type === "done") {
        const all = step.arr.map(() => COLORS.sorted);

        dispatch({ type: "SET_SORT_COLORS", payload: all });
        dispatch({
          type: "SET_SORTED",
          payload: step.arr.map((_, i) => i),
        });

        dispatch({ type: "SET", payload: { running: false, paused: false } });
        dispatch({ type: "SET_SORT_ARR", payload: [...step.arr] });

        runRef.current = false;
        genRef.current = null;
        return false;
      }

      return true;
    },
    [speedRef, dispatch, runRef, genRef],
  );

  /* ---------- PATH ---------- */
  const initPath = useCallback(
    (key: string = algoKey) => {
      runRef.current = false;
      genRef.current = null;

      dispatch({ type: "RESET_GRID_COLORS" });

      dispatch({
        type: "SET_STATS",
        payload: { visited: 0, frontier: 0, pathLen: 0 },
      });

      dispatch({
        type: "SET",
        payload: { running: false, paused: false, inspectedCell: null },
      });

      dispatch({
        type: "SET_NARRATOR",
        payload: {
          step: "ready",
          msg: `${PATH_ALGOS[key].label} — draw walls by clicking/dragging. Move start (green) or end (red). Press Run.`,
          why: PATH_ALGOS[key].why,
        },
      });

      dispatch({ type: "RESET_HISTORY" });
    },
    [algoKey, dispatch, runRef, genRef],
  );

  const processPathStep = useCallback(
    async (
      step: PathStep,
      colorsRef: GridColorsRef,
      cellDataRef: { current: Record<string, any> },
    ): Promise<boolean> => {
      const d = Math.max(6, Math.round(60 / speedRef.current));

      dispatch({
        type: "SET_STATS",
        payload: {
          visited: step.visited || 0,
          frontier: step.frontier || 0,
          ...(step.pathLen ? { pathLen: step.pathLen } : {}),
        },
      });

      if (step.narrate)
        dispatch({
          type: "SET_NARRATOR",
          payload: { step: step.type, msg: step.narrate, why: "" },
        });

      if (step.heatmap)
        dispatch({ type: "SET_HEATMAP", payload: step.heatmap });

      const isStart = step.r === pathStart[0] && step.c === pathStart[1];
      const isEnd = step.r === pathEnd[0] && step.c === pathEnd[1];

      if (!isStart && !isEnd) {
        const cols = colorsRef.current.map((r) => [...r]);

        if (step.type === "visit") cols[step.r][step.c] = "visited";
        if (step.type === "frontier") cols[step.r][step.c] = "frontier";
        if (step.type === "path") cols[step.r][step.c] = "path";

        colorsRef.current = cols;
        dispatch({ type: "SET_GRID_COLORS", payload: cols });
      }

      if (step.gCost !== undefined) {
        const key = `${step.r},${step.c}`;

        const cd = {
          ...cellDataRef.current,
          [key]: { g: step.gCost, h: step.hCost, f: step.fCost },
        };

        cellDataRef.current = cd;

        dispatch({
          type: "SET_CELL_DATA",
          payload: { [key]: { g: step.gCost, h: step.hCost, f: step.fCost } },
        });
      }

      if (step.type === "done") {
        dispatch({ type: "SET", payload: { running: false, paused: false } });
        runRef.current = false;
        genRef.current = null;
        return false;
      }

      if (step.type !== "path") await sleep(d);
      else await sleep(d * 2);

      return true;
    },
    [dispatch, pathStart, pathEnd, runRef, genRef],
  );

  const processGraphStep = useCallback(
    async (
      step: GraphStep,
      nodeColorsRef: { current: Record<string, string> },
      edgeColorsRef: { current: Record<string, string> },
    ): Promise<boolean> => {
      const d = Math.max(80, Math.round(400 / speedRef.current));

      dispatch({
        type: "SET_STATS",
        payload: {
          comps: step.edgesProcessed || 0,
          swaps: step.mstWeight || 0,
          passes: step.mstEdges || 0,
        },
      });

      if (step.line !== undefined)
        dispatch({ type: "SET_ACTIVE_LINE", payload: step.line });

      if (step.narrate)
        dispatch({
          type: "SET_NARRATOR",
          payload: { step: step.type, msg: step.narrate, why: "" },
        });

      const nc = { ...nodeColorsRef.current };
      const ec = { ...edgeColorsRef.current };

      if (step.type === "visit-node" && step.nodeId) {
        nc[step.nodeId] = "visiting";
        nodeColorsRef.current = nc;
        dispatch({ type: "SET_GRAPH_NODE_COLORS", payload: { ...nc } });
        await sleep(d);
      } else if (step.type === "consider-edge" && step.from && step.to) {
        ec[`${step.from}-${step.to}`] = "considering";
        edgeColorsRef.current = ec;
        dispatch({ type: "SET_GRAPH_EDGE_COLORS", payload: { ...ec } });
        await sleep(d * 0.6);
        // Auto-transition to included after showing yellow;
        // for Kruskal/Prim the next add-edge/reject-edge step overrides immediately
        ec[`${step.from}-${step.to}`] = "included";
        edgeColorsRef.current = ec;
        dispatch({ type: "SET_GRAPH_EDGE_COLORS", payload: { ...ec } });
      } else if (step.type === "add-edge" && step.from && step.to) {
        ec[`${step.from}-${step.to}`] = "included";
        nc[step.from] = "result";
        nc[step.to] = "result";
        nodeColorsRef.current = nc;
        edgeColorsRef.current = ec;
        dispatch({ type: "SET_GRAPH_NODE_COLORS", payload: { ...nc } });
        dispatch({ type: "SET_GRAPH_EDGE_COLORS", payload: { ...ec } });
        await sleep(d);
      } else if (step.type === "reject-edge" && step.from && step.to) {
        ec[`${step.from}-${step.to}`] = "rejected";
        edgeColorsRef.current = ec;
        dispatch({ type: "SET_GRAPH_EDGE_COLORS", payload: { ...ec } });
        await sleep(d * 0.4);
      } else if (step.type === "add-to-order" && step.nodeId) {
        nc[step.nodeId] = "result";
        nodeColorsRef.current = nc;
        dispatch({ type: "SET_GRAPH_NODE_COLORS", payload: { ...nc } });
        await sleep(d);
      } else if (step.type === "finish-node" && step.nodeId) {
        nc[step.nodeId] = "visited";
        nodeColorsRef.current = nc;
        dispatch({ type: "SET_GRAPH_NODE_COLORS", payload: { ...nc } });
        await sleep(d * 0.4);
      } else if (step.type === "cycle-found" && step.from && step.to) {
        nc[step.from] = "cycle";
        nc[step.to] = "cycle";
        ec[`${step.from}-${step.to}`] = "included";
        nodeColorsRef.current = nc;
        edgeColorsRef.current = ec;
        dispatch({ type: "SET_GRAPH_NODE_COLORS", payload: { ...nc } });
        dispatch({ type: "SET_GRAPH_EDGE_COLORS", payload: { ...ec } });
        await sleep(d * 2);
      } else if (step.type === "done") {
        dispatch({ type: "SET", payload: { running: false, paused: false } });
        runRef.current = false;
        genRef.current = null;
        return false;
      }

      return true;
    },
    [speedRef, dispatch, runRef, genRef],
  );

  const processTreeStep = useCallback(
    async (
      step: TreeStep,
      nodeColorsRef: { current: Record<string, string> },
      edgeColorsRef: { current: Record<string, string> },
    ): Promise<boolean> => {
      const d = Math.max(80, Math.round(400 / speedRef.current));

      if (step.tree) {
        dispatch({ type: "SET_TREE_DATA", payload: step.tree });
      }

      dispatch({
        type: "SET_STATS",
        payload: {
          comps: step.comparisons || 0,
          swaps: step.insertions || 0,
        },
      });

      if (step.line !== undefined)
        dispatch({ type: "SET_ACTIVE_LINE", payload: step.line });

      if (step.narrate)
        dispatch({
          type: "SET_NARRATOR",
          payload: { step: step.type, msg: step.narrate, why: "" },
        });

      if (step.type === "done") {
        dispatch({ type: "SET", payload: { running: false, paused: false } });
        runRef.current = false;
        genRef.current = null;
        return false;
      }

      const nc = { ...nodeColorsRef.current };
      const ec = { ...edgeColorsRef.current };

      // Clear transient highlights
      const TRANSIENT = new Set(["comparing", "balance-ok", "swap", "split"]);
      for (const k of Object.keys(nc)) {
        if (TRANSIENT.has(nc[k])) delete nc[k];
      }
      for (const k of Object.keys(ec)) {
        if (ec[k] === "traversing") delete ec[k];
      }

      // Color mapping: step type → node color state
      const COLOR_MAP: Record<string, string> = {
        compare: "comparing",
        traverse: "comparing",
        "search-traverse": "comparing",
        "query-visit": "comparing",
        "query-split": "split",
        insert: "inserted",
        create: "inserted",
        "build-leaf": "inserted",
        "build-merge": "inserted",
        "word-complete": "found",
        "query-include": "included",
        found: "found",
        "not-found": "not-found",
        "query-exclude": "excluded",
        extract: "deleted",
        swap: "swap",
        "rotate-left": "rotating",
        "rotate-right": "rotating",
        "balance-check": "rotating",
        "balance-ok": "balance-ok",
        "delete-leaf": "deleted",
        "delete-one-child": "deleted",
        "find-successor": "target",
      };

      // Timing multiplier
      const TIMING: Record<string, number> = {
        init: 0.5,
        compare: 1, traverse: 0.7, "search-traverse": 1,
        insert: 1.2, create: 0.8, found: 1.5, "not-found": 1,
        swap: 1, extract: 1.5,
        "build-leaf": 0.6, "build-merge": 0.6, "build-done": 0.5,
        "word-complete": 1.2,
        "query-visit": 0.7, "query-include": 1, "query-exclude": 0.3, "query-split": 0.7,
        "rotate-left": 1.2, "rotate-right": 1.2,
        "balance-check": 1, "balance-ok": 0.3,
        "delete-leaf": 1.5, "delete-one-child": 1.5, "find-successor": 1.5,
        "delete-done": 1,
      };

      // Clear deleted/target on delete-done
      if (step.type === "delete-done") {
        for (const k of Object.keys(nc)) {
          if (nc[k] === "deleted" || nc[k] === "target") delete nc[k];
        }
      }

      // Apply color
      const colorState = COLOR_MAP[step.type];
      if (colorState && step.nodeId) {
        nc[step.nodeId] = colorState;
        if (step.targetId) nc[step.targetId] = colorState;
      }

      nodeColorsRef.current = nc;
      edgeColorsRef.current = ec;
      dispatch({ type: "SET_TREE_NODE_COLORS", payload: { ...nc } });
      dispatch({ type: "SET_TREE_EDGE_COLORS", payload: { ...ec } });

      const timing = TIMING[step.type] ?? 0.8;
      await sleep(d * timing);

      return true;
    },
    [speedRef, dispatch, runRef, genRef],
  );

  /* ---------- RUN / CONTROL ---------- */

  const run = useCallback(async () => {
    const hist = historyRef.current;
    const histIdx = historyIdxRef.current;
    const needsReplay = histIdx >= 0 && histIdx < hist.length - 1;

    if (category === "sort") {
      const sortedSetRef = { current: new Set<number>() };
      const colorsRef: ColorsRef = {
        current: Array(state.sortArr.length).fill(COLORS.idle),
      };

      if (!needsReplay && !genRef.current) {
        const freshArr = shuffleArr(makeArr());
        dispatch({ type: "SET_SORT_ARR", payload: freshArr });
        genRef.current = SORT_ALGOS[algoKey].fn([...freshArr]);
      }

      runRef.current = true;
      dispatch({ type: "SET", payload: { running: true, paused: false } });

      if (needsReplay) {
        const ok = await replayHistory(histIdx, hist);
        if (!ok || !runRef.current) {
          dispatch({ type: "SET", payload: { running: false, paused: false } });
          runRef.current = false;
          return;
        }
        const lastSnap = hist[hist.length - 1].snapshot;
        if (lastSnap.sortColors) colorsRef.current = [...lastSnap.sortColors];
        if (lastSnap.sortedSet) sortedSetRef.current = new Set(lastSnap.sortedSet);
        if (hist[hist.length - 1].type === "done" || !genRef.current) {
          dispatch({ type: "SET", payload: { running: false, paused: false } });
          runRef.current = false;
          return;
        }
      }

      while (runRef.current) {
        while (pauseRef.current) await sleep(50);

        const { value: step, done } = genRef.current.next();

        if (done || !step) {
          dispatch({ type: "SET", payload: { running: false } });
          runRef.current = false;
          break;
        }

        const cont = await processSortStep(step, sortedSetRef, colorsRef);
        dispatch({
          type: "PUSH_HISTORY",
          payload: {
            type: step.type,
            msg: step.narrate || "",
            snapshot: {
              sortArr: [...step.arr],
              sortColors: [...colorsRef.current],
              sortedSet: [...sortedSetRef.current],
              stats: { comps: step.comps || 0, swaps: step.swaps || 0, passes: step.passes || 0 },
              ...(step.line ? { activeLine: step.line } : {}),
            },
          },
        });
        if (!cont) break;
      }
    } else if (category === "path") {
      const colorsRef: GridColorsRef = {
        current: Array.from({ length: GRID_ROWS_N }, () =>
          Array(GRID_COLS_N).fill("empty"),
        ),
      };
      const cellDataRef = { current: {} as Record<string, any> };

      runRef.current = true;
      dispatch({ type: "SET", payload: { running: true, paused: false } });

      if (needsReplay) {
        const ok = await replayHistory(histIdx, hist);
        if (!ok || !runRef.current) {
          dispatch({ type: "SET", payload: { running: false, paused: false } });
          runRef.current = false;
          return;
        }
        const lastSnap = hist[hist.length - 1].snapshot;
        if (lastSnap.gridColors) colorsRef.current = lastSnap.gridColors.map((r: string[]) => [...r]);
        if (lastSnap.cellData) cellDataRef.current = { ...lastSnap.cellData };
        if (hist[hist.length - 1].type === "done" || !genRef.current) {
          dispatch({ type: "SET", payload: { running: false, paused: false } });
          runRef.current = false;
          return;
        }
      } else {
        dispatch({ type: "RESET_GRID_COLORS" });
        const algo = PATH_ALGOS[algoKey];
        const args =
          algoKey === "astar"
            ? [grid, pathStart, pathEnd, heuristic]
            : [grid, pathStart, pathEnd];
        genRef.current = algo.fn(...args);
      }

      while (runRef.current) {
        while (pauseRef.current) await sleep(50);

        const { value: step, done } = genRef.current.next();

        if (done || !step) {
          dispatch({ type: "SET", payload: { running: false } });
          runRef.current = false;
          break;
        }

        const cont = await processPathStep(step, colorsRef, cellDataRef);
        dispatch({
          type: "PUSH_HISTORY",
          payload: {
            type: step.type,
            msg: step.narrate || "",
            snapshot: {
              gridColors: colorsRef.current.map((r: string[]) => [...r]),
              cellData: { ...cellDataRef.current },
              ...(step.heatmap ? { heatmap: step.heatmap } : {}),
              stats: { visited: step.visited || 0, frontier: step.frontier || 0, pathLen: step.pathLen || 0 },
            },
          },
        });
        if (!cont) break;
      }
    } else if (category === "graph") {
      const nodeColorsRef = { current: {} as Record<string, string> };
      const edgeColorsRef = { current: {} as Record<string, string> };

      runRef.current = true;
      dispatch({ type: "SET", payload: { running: true, paused: false } });

      if (needsReplay) {
        const ok = await replayHistory(histIdx, hist);
        if (!ok || !runRef.current) {
          dispatch({ type: "SET", payload: { running: false, paused: false } });
          runRef.current = false;
          return;
        }
        const lastSnap = hist[hist.length - 1].snapshot;
        if (lastSnap.graphNodeColors) nodeColorsRef.current = { ...lastSnap.graphNodeColors };
        if (lastSnap.graphEdgeColors) edgeColorsRef.current = { ...lastSnap.graphEdgeColors };
        if (hist[hist.length - 1].type === "done" || !genRef.current) {
          dispatch({ type: "SET", payload: { running: false, paused: false } });
          runRef.current = false;
          return;
        }
      } else {
        dispatch({ type: "RESET_GRAPH_COLORS" });
        const algo = GRAPH_ALGOS[algoKey];
        genRef.current = algo.fn(state.graphData);
      }

      while (runRef.current) {
        while (pauseRef.current) await sleep(50);

        const { value: step, done } = genRef.current.next();

        if (done || !step) {
          dispatch({ type: "SET", payload: { running: false } });
          runRef.current = false;
          break;
        }

        const cont = await processGraphStep(step, nodeColorsRef, edgeColorsRef);
        dispatch({
          type: "PUSH_HISTORY",
          payload: {
            type: step.type,
            msg: step.narrate || "",
            snapshot: {
              graphNodeColors: { ...nodeColorsRef.current },
              graphEdgeColors: { ...edgeColorsRef.current },
              stats: { comps: step.edgesProcessed || 0, swaps: step.mstWeight || 0, passes: step.mstEdges || 0 },
              ...(step.line ? { activeLine: step.line } : {}),
            },
          },
        });
        if (!cont) break;
      }
    } else if (category === "tree") {
      const nodeColorsRef = { current: {} as Record<string, string> };
      const edgeColorsRef = { current: {} as Record<string, string> };
      let lastTreeData = state.treeData;

      runRef.current = true;
      dispatch({ type: "SET", payload: { running: true, paused: false } });

      if (needsReplay) {
        const ok = await replayHistory(histIdx, hist);
        if (!ok || !runRef.current) {
          dispatch({ type: "SET", payload: { running: false, paused: false } });
          runRef.current = false;
          return;
        }
        const lastSnap = hist[hist.length - 1].snapshot;
        if (lastSnap.treeNodeColors) nodeColorsRef.current = { ...lastSnap.treeNodeColors };
        if (lastSnap.treeEdgeColors) edgeColorsRef.current = { ...lastSnap.treeEdgeColors };
        if (lastSnap.treeData) lastTreeData = lastSnap.treeData;
        if (hist[hist.length - 1].type === "done" || !genRef.current) {
          dispatch({ type: "SET", payload: { running: false, paused: false } });
          runRef.current = false;
          return;
        }
      } else {
        dispatch({ type: "RESET_TREE_COLORS" });
        const algo = TREE_ALGOS[algoKey];
        genRef.current = algo.fn(state.treeInput);
      }

      while (runRef.current) {
        while (pauseRef.current) await sleep(50);

        const { value: step, done } = genRef.current.next();

        if (done || !step) {
          dispatch({ type: "SET", payload: { running: false } });
          runRef.current = false;
          break;
        }

        const cont = await processTreeStep(step, nodeColorsRef, edgeColorsRef);
        if (step.tree) lastTreeData = step.tree;
        dispatch({
          type: "PUSH_HISTORY",
          payload: {
            type: step.type,
            msg: step.narrate || "",
            snapshot: {
              treeData: lastTreeData,
              treeNodeColors: { ...nodeColorsRef.current },
              treeEdgeColors: { ...edgeColorsRef.current },
              stats: { comps: step.comparisons || 0, swaps: step.insertions || 0 },
              ...(step.line ? { activeLine: step.line } : {}),
            },
          },
        });
        if (!cont) break;
      }
    }
  }, [
    category,
    algoKey,
    state.sortArr,
    state.graphData,
    state.treeInput,
    state.treeData,
    grid,
    pathStart,
    pathEnd,
    heuristic,
    processSortStep,
    processPathStep,
    processGraphStep,
    processTreeStep,
    replayHistory,
    dispatch,
    runRef,
    pauseRef,
    genRef,
  ]);

  const pause = useCallback(() => {
    pauseRef.current = !pauseRef.current;
    dispatch({ type: "SET", payload: { paused: pauseRef.current } });
  }, [dispatch, pauseRef]);

  const stop = useCallback(() => {
    runRef.current = false;
    pauseRef.current = false;
    genRef.current = null;

    dispatch({ type: "SET", payload: { running: false, paused: false } });

    if (category === "sort") initSort(algoKey);
    else if (category === "path") initPath(algoKey);
    else if (category === "graph") initGraph(algoKey);
    else if (category === "tree") initTree(algoKey);
  }, [
    runRef,
    pauseRef,
    genRef,
    dispatch,
    category,
    algoKey,
    initSort,
    initPath,
    initGraph,
    initTree,
  ]);

  const stepOnce = useCallback(async () => {
    if (category === "sort") {
      const sortedSetRef = { current: new Set<number>(state.sortedSet) };
      const colorsRef: ColorsRef = { current: [...state.sortColors] };

      if (!genRef.current) {
        genRef.current = SORT_ALGOS[algoKey].fn([...state.sortArr]);
      }

      const { value: step, done } = genRef.current.next();
      if (done || !step) return;

      await processSortStep(step, sortedSetRef, colorsRef);
      dispatch({
        type: "PUSH_HISTORY",
        payload: {
          type: step.type,
          msg: step.narrate || "",
          snapshot: {
            sortArr: [...step.arr],
            sortColors: [...colorsRef.current],
            sortedSet: [...sortedSetRef.current],
            stats: { comps: step.comps || 0, swaps: step.swaps || 0, passes: step.passes || 0 },
            ...(step.line ? { activeLine: step.line } : {}),
          },
        },
      });
    } else if (category === "path") {
      const colorsRef: GridColorsRef = {
        current: state.gridColors.map((r) => [...r]),
      };

      const cellDataRef = { current: { ...state.cellData } };

      if (!genRef.current) {
        dispatch({ type: "RESET_GRID_COLORS" });

        const algo = PATH_ALGOS[algoKey];

        const args =
          algoKey === "astar"
            ? [grid, pathStart, pathEnd, heuristic]
            : [grid, pathStart, pathEnd];

        genRef.current = algo.fn(...args);
      }

      const { value: step, done } = genRef.current.next();
      if (done || !step) return;

      await processPathStep(step, colorsRef, cellDataRef);
      dispatch({
        type: "PUSH_HISTORY",
        payload: {
          type: step.type,
          msg: step.narrate || "",
          snapshot: {
            gridColors: colorsRef.current.map((r) => [...r]),
            cellData: { ...cellDataRef.current },
            ...(step.heatmap ? { heatmap: step.heatmap } : {}),
            stats: { visited: step.visited || 0, frontier: step.frontier || 0, pathLen: step.pathLen || 0 },
          },
        },
      });
    } else if (category === "graph") {
      const nodeColorsRef = { current: { ...state.graphNodeColors } };
      const edgeColorsRef = { current: { ...state.graphEdgeColors } };

      if (!genRef.current) {
        dispatch({ type: "RESET_GRAPH_COLORS" });
        const algo = GRAPH_ALGOS[algoKey];
        genRef.current = algo.fn(state.graphData);
      }

      const { value: step, done } = genRef.current.next();
      if (done || !step) return;

      await processGraphStep(step, nodeColorsRef, edgeColorsRef);
      dispatch({
        type: "PUSH_HISTORY",
        payload: {
          type: step.type,
          msg: step.narrate || "",
          snapshot: {
            graphNodeColors: { ...nodeColorsRef.current },
            graphEdgeColors: { ...edgeColorsRef.current },
            stats: { comps: step.edgesProcessed || 0, swaps: step.mstWeight || 0, passes: step.mstEdges || 0 },
            ...(step.line ? { activeLine: step.line } : {}),
          },
        },
      });
    } else if (category === "tree") {
      const nodeColorsRef = { current: { ...state.treeNodeColors } };
      const edgeColorsRef = { current: { ...state.treeEdgeColors } };

      if (!genRef.current) {
        dispatch({ type: "RESET_TREE_COLORS" });
        const algo = TREE_ALGOS[algoKey];
        genRef.current = algo.fn(state.treeInput);
      }

      const { value: step, done } = genRef.current.next();
      if (done || !step) return;

      await processTreeStep(step, nodeColorsRef, edgeColorsRef);
      dispatch({
        type: "PUSH_HISTORY",
        payload: {
          type: step.type,
          msg: step.narrate || "",
          snapshot: {
            treeData: step.tree || state.treeData,
            treeNodeColors: { ...nodeColorsRef.current },
            treeEdgeColors: { ...edgeColorsRef.current },
            stats: { comps: step.comparisons || 0, swaps: step.insertions || 0 },
            ...(step.line ? { activeLine: step.line } : {}),
          },
        },
      });
    }
  }, [
    category,
    algoKey,
    state,
    grid,
    pathStart,
    pathEnd,
    heuristic,
    processSortStep,
    processPathStep,
    processGraphStep,
    processTreeStep,
    dispatch,
    genRef,
  ]);

  /* ---------- keyboard ---------- */

  const actionsRef = useRef({ run, pause, stepOnce, stop });

  useEffect(() => {
    actionsRef.current = { run, pause, stepOnce, stop };
  }, [run, pause, stepOnce, stop]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        if (state.running) actionsRef.current.pause();
        else actionsRef.current.run();
      }

      if (e.code === "ArrowRight") actionsRef.current.stepOnce();
      if (e.code === "Escape") actionsRef.current.stop();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.running]);

  return { run, pause, stop, stepOnce, jumpToStep, initSort, initPath, initGraph, initTree, COLORS };
}
