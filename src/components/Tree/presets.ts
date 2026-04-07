export type TreeNodeViz = {
  id: string;
  value: number;
  x: number;
  y: number;
  label?: string;
  sublabel?: string;
  endMarker?: boolean;
};

export type TreeEdgeViz = {
  from: string;
  to: string;
};

export type TreeVizData = {
  nodes: TreeNodeViz[];
  edges: TreeEdgeViz[];
};

export type TreeInput = {
  values?: number[];
  target?: number;
  words?: string[];
  searchWord?: string;
  queryRange?: [number, number];
};

export const TREE_PRESETS: Record<string, { label: string; input: TreeInput }> = {
  balanced: {
    label: "Balanced",
    input: { values: [50, 25, 75, 12, 37, 62, 87] },
  },
  large: {
    label: "Large",
    input: { values: [50, 25, 75, 12, 37, 62, 87, 6, 18, 31, 43, 56, 68] },
  },
  skewed: {
    label: "Skewed",
    input: { values: [10, 20, 30, 40, 50, 60, 70] },
  },
};

export function defaultInputForAlgo(key: string): TreeInput {
  if (key === "bstSearch")
    return { values: [50, 25, 75, 12, 37, 62, 87, 6, 31, 43], target: 31 };
  if (key === "bstDelete")
    return { values: [50, 25, 75, 12, 37, 62, 87, 6, 31], target: 25 };
  if (key === "avlInsert")
    return { values: [30, 20, 40, 10, 25, 35, 50, 5, 15, 28] };
  if (key === "avlDelete")
    return { values: [50, 25, 75, 12, 37, 62, 6], target: 62 };
  if (key === "heapBuild")
    return { values: [4, 10, 3, 5, 1, 8, 2, 7, 6, 9] };
  if (key === "trieInsert")
    return { words: ["cat", "car", "card", "care", "do", "dog", "dot"], searchWord: "card" };
  if (key === "segTree")
    return { values: [2, 1, 5, 3, 4, 7], queryRange: [1, 4] };
  return { values: [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45] };
}
