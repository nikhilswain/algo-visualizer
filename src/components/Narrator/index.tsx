import { useStore } from "../../store";
import { COLORS as C } from "../../theme";

const TYPE_COLORS = {
  ready: C.textMuted,
  compare: C.compare,
  swap: C.swap,
  sorted: C.sorted,
  pivot: C.pivot,
  current: C.current,
  visit: C.blue,
  frontier: C.purple,
  path: C.purple,
  done: C.teal,
};

export default function Narrator() {
  const { state } = useStore();
  const { narrator } = state;

  const col = TYPE_COLORS[narrator.step] || C.textMuted;

  return (
    <div
      style={{
        background: "#080d0a",
        border: `1px solid ${C.teal}30`,
        borderRadius: 10,
        padding: "12px 16px",
        minHeight: 70,
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: col,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          marginBottom: 4,
          fontFamily: "inherit",
        }}
      >
        {narrator.step}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#c8eadc",
          lineHeight: 1.55,
          fontFamily: "inherit",
          minHeight: 20,
        }}
      >
        {narrator.msg}
      </div>
      {narrator.why && (
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: "#5a8a70",
            lineHeight: 1.5,
            fontFamily: "inherit",
            borderTop: `1px solid ${C.teal}15`,
            paddingTop: 6,
          }}
        >
          {narrator.why}
        </div>
      )}
    </div>
  );
}
