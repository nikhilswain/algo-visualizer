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
  "visit-node": C.current,
  "consider-edge": C.pivot,
  "add-edge": C.sorted,
  "reject-edge": C.swap,
  "add-to-order": C.sorted,
  "finish-node": C.purple,
  "cycle-found": C.swap,
  // tree
  init: C.textMuted,
  insert: C.sorted,
  found: C.sorted,
  "not-found": C.swap,
  "delete-leaf": C.swap,
  "delete-one-child": C.swap,
  "find-successor": C.pivot,
  "delete-done": C.sorted,
  "balance-check": C.pivot,
  "balance-ok": C.purple,
  "rotate-left": C.pivot,
  "rotate-right": C.pivot,
  // heap
  extract: C.swap,
  "build-done": C.sorted,
  // trie
  traverse: C.blue,
  create: C.sorted,
  "word-complete": C.sorted,
  "search-traverse": C.blue,
  // segment tree
  "build-leaf": C.sorted,
  "build-merge": C.purple,
  "query-include": C.sorted,
  "query-exclude": C.textMuted,
  "query-split": C.blue,
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
