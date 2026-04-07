/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useReducer, useRef } from "react";

import type { ReactNode, Dispatch, RefObject } from "react";
import { addDefaultWalls } from "../utils/addDefaultWalls";
import { makeGrid } from "../utils/makeGrid";
import type { CellType, Grid } from "../types";
import type { GraphData } from "../components/Graph/presets";
import type { TreeVizData, TreeInput } from "../components/Tree/presets";
import { GRID_COLS, GRID_ROWS } from "../constants";

type Stats = {
  comps: number;
  swaps: number;
  passes: number;
  visited: number;
  frontier: number;
  pathLen: number;
};

type Narrator = {
  step: string;
  msg: string;
  why: string;
};

type CellMeta = {
  g?: number;
  h?: number;
  f?: number;
  parent?: [number, number];
};

type State = {
  category: "sort" | "path" | "graph" | "tree";
  algoKey: string;
  lang: "js" | "py";
  heuristic: string;

  sortArr: number[];
  sortColors: string[];
  sortedSet: Set<number>;
  activeLine: { js: number; py: number };

  grid: Grid;
  gridColors: string[][];
  pathStart: [number, number];
  pathEnd: [number, number];
  inspectedCell: [number, number] | null;
  cellData: Record<string, CellMeta>;
  heatmap: number[][] | null;

  graphData: GraphData;
  graphNodeColors: Record<string, string>;
  graphEdgeColors: Record<string, string>;

  treeInput: TreeInput;
  treeData: TreeVizData;
  treeNodeColors: Record<string, string>;
  treeEdgeColors: Record<string, string>;

  running: boolean;
  paused: boolean;
  speed: number;
  stats: Stats;
  narrator: Narrator;

  history: any[];
  historyIdx: number;

  compareMode: boolean;
  compareAlgoKey: string;

  debugMode: boolean;
  debugData: Record<string, any>;
};

type Action =
  | { type: "SET"; payload: Partial<State> }
  | { type: "SET_CATEGORY"; payload: State["category"] }
  | { type: "SET_ALGO"; payload: string }
  | { type: "SET_STATS"; payload: Partial<Stats> }
  | { type: "SET_NARRATOR"; payload: Narrator }
  | { type: "SET_SORT_COLORS"; payload: string[] }
  | { type: "SET_SORTED"; payload: number[] }
  | { type: "SET_SORT_ARR"; payload: number[] }
  | { type: "SET_ACTIVE_LINE"; payload: { js: number; py: number } }
  | { type: "SET_GRID"; payload: Grid }
  | { type: "SET_GRID_COLORS"; payload: string[][] }
  | { type: "SET_CELL"; r: number; c: number; val: CellType }
  | { type: "SET_PATH_ENDS"; start?: [number, number]; end?: [number, number] }
  | { type: "SET_INSPECTED"; payload: [number, number] | null }
  | { type: "SET_CELL_DATA"; payload: Record<string, CellMeta> }
  | { type: "SET_HEATMAP"; payload: number[][] | null }
  | { type: "PUSH_HISTORY"; payload: any }
  | { type: "SET_HIST_IDX"; payload: number }
  | { type: "RESET_HISTORY" }
  | { type: "RESET_GRID_COLORS" }
  | { type: "SET_GRAPH_DATA"; payload: GraphData }
  | { type: "SET_GRAPH_NODE_COLORS"; payload: Record<string, string> }
  | { type: "SET_GRAPH_EDGE_COLORS"; payload: Record<string, string> }
  | { type: "RESET_GRAPH_COLORS" }
  | { type: "SET_TREE_INPUT"; payload: TreeInput }
  | { type: "SET_TREE_DATA"; payload: TreeVizData }
  | { type: "SET_TREE_NODE_COLORS"; payload: Record<string, string> }
  | { type: "SET_TREE_EDGE_COLORS"; payload: Record<string, string> }
  | { type: "RESET_TREE_COLORS" }
  | { type: "JUMP_TO_STEP"; payload: number };

type CtxType = {
  state: State;
  dispatch: Dispatch<Action>;
  runRef: RefObject<boolean>;
  pauseRef: RefObject<boolean>;
  genRef: RefObject<any>;
};

/* ---------- context ---------- */

const Ctx = createContext<CtxType | null>(null);

/* ---------- state ---------- */

const initState: State = {
  category: "sort",
  algoKey: "bubble",
  lang: "js",
  heuristic: "manhattan",

  sortArr: [],
  sortColors: [],
  sortedSet: new Set(),
  activeLine: { js: -1, py: -1 },

  grid: addDefaultWalls(makeGrid()),
  gridColors: Array.from({ length: GRID_ROWS }, () =>
    Array(GRID_COLS).fill("empty"),
  ),
  pathStart: [3, 3],
  pathEnd: [GRID_ROWS - 4, GRID_COLS - 4],
  inspectedCell: null,
  cellData: {},
  heatmap: null,

  graphData: { nodes: [], edges: [] },
  graphNodeColors: {},
  graphEdgeColors: {},

  treeInput: { values: [] },
  treeData: { nodes: [], edges: [] },
  treeNodeColors: {},
  treeEdgeColors: {},

  running: false,
  paused: false,
  speed: 2,
  stats: { comps: 0, swaps: 0, passes: 0, visited: 0, frontier: 0, pathLen: 0 },
  narrator: {
    step: "ready",
    msg: "Choose an algorithm and press Run.",
    why: "",
  },

  history: [],
  historyIdx: -1,

  compareMode: false,
  compareAlgoKey: "dijkstra",

  debugMode: false,
  debugData: {},
};

/* ---------- reducer ---------- */

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET":
      return { ...state, ...action.payload };
    case "SET_CATEGORY":
      return {
        ...state,
        category: action.payload,
        running: false,
        paused: false,
        history: [],
        historyIdx: -1,
      };
    case "SET_ALGO":
      return {
        ...state,
        algoKey: action.payload,
        running: false,
        paused: false,
        activeLine: { js: -1, py: -1 },
      };
    case "SET_STATS":
      return { ...state, stats: { ...state.stats, ...action.payload } };
    case "SET_NARRATOR":
      return { ...state, narrator: action.payload };
    case "SET_SORT_COLORS":
      return { ...state, sortColors: action.payload };
    case "SET_SORTED":
      return { ...state, sortedSet: new Set(action.payload) };
    case "SET_SORT_ARR":
      return { ...state, sortArr: action.payload };
    case "SET_ACTIVE_LINE":
      return { ...state, activeLine: action.payload };
    case "SET_GRID":
      return { ...state, grid: action.payload };
    case "SET_GRID_COLORS":
      return { ...state, gridColors: action.payload };
    case "SET_CELL": {
      const g = state.grid.map((r) => [...r]);
      g[action.r][action.c] = action.val;
      return { ...state, grid: g };
    }
    case "SET_PATH_ENDS":
      return {
        ...state,
        pathStart: action.start ?? state.pathStart,
        pathEnd: action.end ?? state.pathEnd,
      };
    case "SET_INSPECTED":
      return { ...state, inspectedCell: action.payload };
    case "SET_CELL_DATA":
      return { ...state, cellData: { ...state.cellData, ...action.payload } };
    case "SET_HEATMAP":
      return { ...state, heatmap: action.payload };
    case "PUSH_HISTORY": {
      const newHist = [...state.history, action.payload];
      return { ...state, history: newHist, historyIdx: newHist.length - 1 };
    }
    case "JUMP_TO_STEP": {
      const idx = action.payload;
      const entry = state.history[idx];
      if (!entry) return state;
      const s = entry.snapshot || {};
      return {
        ...state,
        historyIdx: idx,
        running: false,
        paused: false,
        narrator: { step: entry.type, msg: entry.msg, why: "" },
        stats: s.stats ? { ...state.stats, ...s.stats } : state.stats,
        activeLine: s.activeLine || state.activeLine,
        sortArr: s.sortArr !== undefined ? s.sortArr : state.sortArr,
        sortColors: s.sortColors !== undefined ? s.sortColors : state.sortColors,
        sortedSet: s.sortedSet !== undefined ? new Set(s.sortedSet) : state.sortedSet,
        gridColors: s.gridColors !== undefined ? s.gridColors : state.gridColors,
        cellData: s.cellData !== undefined ? s.cellData : state.cellData,
        heatmap: s.heatmap !== undefined ? s.heatmap : state.heatmap,
        graphNodeColors: s.graphNodeColors !== undefined ? s.graphNodeColors : state.graphNodeColors,
        graphEdgeColors: s.graphEdgeColors !== undefined ? s.graphEdgeColors : state.graphEdgeColors,
        treeData: s.treeData !== undefined ? s.treeData : state.treeData,
        treeNodeColors: s.treeNodeColors !== undefined ? s.treeNodeColors : state.treeNodeColors,
        treeEdgeColors: s.treeEdgeColors !== undefined ? s.treeEdgeColors : state.treeEdgeColors,
      };
    }
    case "SET_HIST_IDX":
      return { ...state, historyIdx: action.payload };
    case "RESET_HISTORY":
      return { ...state, history: [], historyIdx: -1 };
    case "RESET_GRID_COLORS":
      return {
        ...state,
        gridColors: Array.from({ length: GRID_ROWS }, () =>
          Array(GRID_COLS).fill("empty"),
        ),
        cellData: {},
        heatmap: null,
      };
    case "SET_GRAPH_DATA":
      return { ...state, graphData: action.payload };
    case "SET_GRAPH_NODE_COLORS":
      return { ...state, graphNodeColors: action.payload };
    case "SET_GRAPH_EDGE_COLORS":
      return { ...state, graphEdgeColors: action.payload };
    case "RESET_GRAPH_COLORS":
      return { ...state, graphNodeColors: {}, graphEdgeColors: {} };
    case "SET_TREE_INPUT":
      return { ...state, treeInput: action.payload };
    case "SET_TREE_DATA":
      return { ...state, treeData: action.payload };
    case "SET_TREE_NODE_COLORS":
      return { ...state, treeNodeColors: action.payload };
    case "SET_TREE_EDGE_COLORS":
      return { ...state, treeEdgeColors: action.payload };
    case "RESET_TREE_COLORS":
      return { ...state, treeNodeColors: {}, treeEdgeColors: {} };
    default:
      return state;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initState);
  const runRef = useRef<boolean>(false);
  const pauseRef = useRef<boolean>(false);
  const genRef = useRef<any>(null);

  return (
    <Ctx.Provider value={{ state, dispatch, runRef, pauseRef, genRef }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore(): CtxType {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
