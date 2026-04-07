import { useRef, useEffect } from "react";
import { useStore } from "../../store";
import { COLORS as C } from "../../theme";

const TYPE_COLORS: Record<string, string> = {
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
  extract: C.swap,
  "build-done": C.sorted,
  traverse: C.blue,
  create: C.sorted,
  "word-complete": C.sorted,
  "search-traverse": C.blue,
  "build-leaf": C.sorted,
  "build-merge": C.purple,
  "query-include": C.sorted,
  "query-exclude": C.textMuted,
  "query-split": C.blue,
};

export default function Logger() {
  const { state, dispatch, runRef, pauseRef } = useStore();
  const { history, historyIdx, running } = state;

  const containerRef = useRef<HTMLDivElement>(null);
  const isNearBottom = useRef(true);

  const onScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    isNearBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  };

  useEffect(() => {
    if (isNearBottom.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history.length]);

  const jumpTo = (idx: number) => {
    if (running) {
      runRef.current = false;
      pauseRef.current = false;
    }
    dispatch({ type: "JUMP_TO_STEP", payload: idx });
  };

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      style={{
        background: "#080d0a",
        border: `1px solid ${C.teal}30`,
        borderRadius: 10,
        maxHeight: 150,
        minHeight: 60,
        overflowY: "auto",
        padding: "4px 0",
      }}
    >
      {history.length === 0 && (
        <div
          style={{
            padding: "16px 16px",
            color: C.textMuted,
            fontSize: 12,
            fontFamily: "inherit",
          }}
        >
          Press Run to start logging steps…
        </div>
      )}
      {history.map((entry: any, idx: number) => {
        const isActive = idx === historyIdx;
        const col = TYPE_COLORS[entry.type] || C.textMuted;
        return (
          <div
            key={idx}
            onClick={() => jumpTo(idx)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "2px 12px",
              cursor: "pointer",
              background: isActive ? `${C.teal}15` : "transparent",
              borderLeft: isActive
                ? `2px solid ${C.teal}`
                : "2px solid transparent",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              if (!isActive)
                (e.currentTarget as HTMLDivElement).style.background = `${C.teal}0a`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = isActive
                ? `${C.teal}15`
                : "transparent";
            }}
          >
            <span
              style={{
                fontSize: 8,
                color: C.textDim,
                minWidth: 22,
                textAlign: "right",
                fontFamily: "inherit",
              }}
            >
              {idx + 1}
            </span>
            <span
              style={{
                fontSize: 9,
                color: col,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                minWidth: 80,
                fontFamily: "inherit",
                flexShrink: 0,
              }}
            >
              {entry.type}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "#c8eadc",
                fontFamily: "inherit",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                opacity: entry.msg ? 1 : 0.4,
              }}
            >
              {entry.msg || "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
