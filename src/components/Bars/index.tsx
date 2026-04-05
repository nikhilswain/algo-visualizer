import { useStore } from "../../store";
import { COLORS as C } from "../../theme";

const STATE_COLORS = {
  idle: C.idle,
  compare: C.compare,
  swap: C.swap,
  sorted: C.sorted,
  pivot: C.pivot,
  current: C.current,
};

export default function SortBars() {
  const { state } = useStore();
  const { sortArr, sortColors } = state;

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: "14px 10px 8px",
        height: 300,
        display: "flex",
        alignItems: "flex-end",
        gap: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* faint horizontal guide lines */}
      {[25, 50, 75].map((pct) => (
        <div
          key={pct}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: `${pct * 0.9 + 4}%`,
            height: 1,
            background: `${C.border}88`,
            pointerEvents: "none",
          }}
        />
      ))}
      {sortArr.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${v * 0.9}%`,
            minWidth: 0,
            background: sortColors[i] || STATE_COLORS.idle,
            borderRadius: "2px 2px 0 0",
            transition: "height 0.06s ease, background 0.1s ease",
            transformOrigin: "bottom",
            position: "relative",
          }}
        />
      ))}
    </div>
  );
}
