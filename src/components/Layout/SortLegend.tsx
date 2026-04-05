import { COLORS as C } from "../../theme";

const SORT_LEGEND = [
  ["comparing", C.compare],
  ["swapping", C.swap],
  ["sorted", C.sorted],
  ["pivot", C.pivot],
  ["current", C.current],
  ["idle", C.idle],
];

export default function SortLegend() {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {SORT_LEGEND.map(([label, color]) => (
        <div
          key={label}
          style={{ display: "flex", alignItems: "center", gap: 5 }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: color,
              border: `1px solid ${C.border}`,
            }}
          />
          <span style={{ fontSize: 10, color: C.textMuted }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
