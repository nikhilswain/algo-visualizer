export type GraphNode = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type GraphEdge = {
  from: string;
  to: string;
  weight?: number;
  directed: boolean;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

const dagPreset: GraphData = {
  nodes: [
    { id: "A", label: "A", x: 80, y: 60 },
    { id: "B", label: "B", x: 220, y: 60 },
    { id: "C", label: "C", x: 80, y: 220 },
    { id: "D", label: "D", x: 220, y: 220 },
    { id: "E", label: "E", x: 380, y: 140 },
    { id: "F", label: "F", x: 520, y: 60 },
    { id: "G", label: "G", x: 520, y: 220 },
    { id: "H", label: "H", x: 660, y: 140 },
  ],
  edges: [
    { from: "A", to: "B", directed: true },
    { from: "A", to: "C", directed: true },
    { from: "B", to: "D", directed: true },
    { from: "B", to: "E", directed: true },
    { from: "C", to: "D", directed: true },
    { from: "D", to: "F", directed: true },
    { from: "E", to: "F", directed: true },
    { from: "E", to: "G", directed: true },
    { from: "F", to: "H", directed: true },
    { from: "G", to: "H", directed: true },
  ],
};

const weightedPreset: GraphData = {
  nodes: [
    { id: "A", label: "A", x: 100, y: 100 },
    { id: "B", label: "B", x: 300, y: 50 },
    { id: "C", label: "C", x: 500, y: 100 },
    { id: "D", label: "D", x: 100, y: 300 },
    { id: "E", label: "E", x: 300, y: 250 },
    { id: "F", label: "F", x: 500, y: 300 },
    { id: "G", label: "G", x: 300, y: 400 },
  ],
  edges: [
    { from: "A", to: "B", weight: 4, directed: false },
    { from: "A", to: "D", weight: 2, directed: false },
    { from: "B", to: "C", weight: 6, directed: false },
    { from: "B", to: "E", weight: 3, directed: false },
    { from: "C", to: "F", weight: 1, directed: false },
    { from: "D", to: "E", weight: 5, directed: false },
    { from: "D", to: "G", weight: 8, directed: false },
    { from: "E", to: "F", weight: 7, directed: false },
    { from: "E", to: "G", weight: 4, directed: false },
    { from: "F", to: "G", weight: 9, directed: false },
  ],
};

const cyclePreset: GraphData = {
  nodes: [
    { id: "A", label: "A", x: 100, y: 150 },
    { id: "B", label: "B", x: 260, y: 60 },
    { id: "C", label: "C", x: 420, y: 60 },
    { id: "D", label: "D", x: 260, y: 270 },
    { id: "E", label: "E", x: 420, y: 270 },
    { id: "F", label: "F", x: 560, y: 150 },
  ],
  edges: [
    { from: "A", to: "B", directed: true },
    { from: "B", to: "C", directed: true },
    { from: "C", to: "E", directed: true },
    { from: "E", to: "B", directed: true },
    { from: "A", to: "D", directed: true },
    { from: "D", to: "F", directed: true },
  ],
};

const noCyclePreset: GraphData = {
  nodes: [
    { id: "A", label: "A", x: 100, y: 150 },
    { id: "B", label: "B", x: 260, y: 60 },
    { id: "C", label: "C", x: 420, y: 60 },
    { id: "D", label: "D", x: 260, y: 270 },
    { id: "E", label: "E", x: 420, y: 270 },
    { id: "F", label: "F", x: 560, y: 150 },
  ],
  edges: [
    { from: "A", to: "B", directed: true },
    { from: "A", to: "D", directed: true },
    { from: "B", to: "C", directed: true },
    { from: "C", to: "F", directed: true },
    { from: "D", to: "E", directed: true },
    { from: "E", to: "F", directed: true },
  ],
};

export const GRAPH_PRESETS = {
  dag: { label: "DAG", data: dagPreset },
  weighted: { label: "Weighted", data: weightedPreset },
  cycle: { label: "Directed (cycle)", data: cyclePreset },
  noCycle: { label: "Directed (no cycle)", data: noCyclePreset },
};

export function defaultPresetForAlgo(key: string): GraphData {
  if (key === "topo") return dagPreset;
  if (key === "cycleDetect") return cyclePreset;
  return weightedPreset;
}
