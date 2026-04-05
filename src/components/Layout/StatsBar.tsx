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

  const sortStats = [
    { label: "comparisons", value: stats.comps, color: C.compare },
    { label: "swaps", value: stats.swaps, color: C.swap },
    { label: "passes", value: stats.passes, color: C.current },
    { label: "array size", value: 38, color: C.textMuted },
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

  const items = category === "sort" ? sortStats : pathStats;

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {items.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
