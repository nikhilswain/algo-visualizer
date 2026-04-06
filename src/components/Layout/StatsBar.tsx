import { SORT_ALGOS } from "../../algorithms/sorting";
import { useStore } from "../../store";
import { COLORS as C } from "../../theme";

function StatCard({ label, value, color }) {
  return (
    <div
      style={{
        background: C.surfaceAlt,
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        padding: "8px 12px",
        flex: 1,
        minWidth: 70,
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: C.textMuted,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: color || C.text,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function StatsBar() {
  const { state } = useStore();
  const { category, stats } = state;

  const algo = SORT_ALGOS[state.algoKey];
  const isNonComparison = algo?.category === "non-comparison";

  const statsConfig = [
    {
      key: "comps",
      label: isNonComparison ? "operations" : "comparisons",
      value: isNonComparison ? stats.passes : stats.comps,
      color: C.compare,
    },
    {
      key: "swaps",
      label: isNonComparison ? "writes" : "swaps",
      value: stats.swaps,
      color: C.swap,
    },
    {
      key: "passes",
      label: "passes",
      value: stats.passes,
      color: C.current,
    },
    {
      key: "size",
      label: "array size",
      value: state.sortArr.length,
      color: C.textMuted,
    },
  ];

  const pathStats = [
    { label: "cells visited", value: stats.visited, color: C.blue },
    { label: "frontier", value: stats.frontier, color: C.purple },
    {
      label: "path length",
      value: stats.pathLen || "-",
      color: stats.pathLen ? C.sorted : C.textMuted,
    },
    { label: "grid size", value: "18×28", color: C.textMuted },
  ];

  const graphStats = [
    { label: "edges processed", value: stats.comps, color: C.blue },
    { label: "MST weight", value: stats.swaps || "-", color: C.purple },
    { label: "edges in result", value: stats.passes || "-", color: C.sorted },
    { label: "nodes", value: state.graphData?.nodes?.length || 0, color: C.textMuted },
  ];

  const items = category === "sort" ? statsConfig : category === "path" ? pathStats : graphStats;

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {items.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
