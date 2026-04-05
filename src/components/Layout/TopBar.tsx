import { useStore } from "../../store";
import { useVisualizer } from "../../hooks/useVisualizer";
import { SORT_ALGOS } from "../../algorithms/sorting";
import { PATH_ALGOS } from "../../algorithms/pathfinding";
import { COLORS as C } from "../../theme";

const HEURISTICS = ["manhattan", "euclidean", "diagonal"];

function Tag({ children, color }) {
  return (
    <span
      style={{
        padding: "1px 7px",
        fontSize: 9,
        borderRadius: 99,
        border: `1px solid ${color}55`,
        color,
        letterSpacing: ".06em",
      }}
    >
      {children}
    </span>
  );
}

export default function TopBar() {
  const { state, dispatch } = useStore();
  const { category, algoKey, heuristic, running } = state;
  const { initSort, initPath } = useVisualizer();

  const algos = category === "sort" ? SORT_ALGOS : PATH_ALGOS;
  const algo = algos[algoKey];

  const switchCategory = (cat) => {
    dispatch({ type: "SET_CATEGORY", payload: cat });
    const defaultKey = cat === "sort" ? "bubble" : "astar";
    dispatch({ type: "SET_ALGO", payload: defaultKey });
    if (cat === "sort") initSort(defaultKey);
    else initPath(defaultKey);
  };

  const switchAlgo = (key) => {
    if (running) return;
    dispatch({ type: "SET_ALGO", payload: key });
    if (category === "sort") initSort(key);
    else initPath(key);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Row 1: category + title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 4 }}>
          {["sort", "path"].map((cat) => (
            <button
              key={cat}
              onClick={() => switchCategory(cat)}
              style={{
                padding: "5px 14px",
                fontSize: 11,
                fontFamily: "inherit",
                letterSpacing: ".06em",
                borderRadius: 5,
                cursor: "pointer",
                border: `1px solid ${category === cat ? C.purple : C.border}`,
                background: category === cat ? `${C.purple}20` : "transparent",
                color: category === cat ? C.purple : C.textMuted,
                transition: "all .15s",
              }}
            >
              {cat === "sort" ? "Sorting" : "Pathfinding"}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: C.border }} />

        <div>
          <span style={{ fontSize: 11, color: C.textMuted }}>
            {algo?.label}
          </span>
        </div>

        {algo?.complexity && (
          <div
            style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: 4 }}
          >
            {[
              ["avg", algo.complexity.avg || algo.complexity.time],
              ["best", algo.complexity.best],
              ["space", algo.complexity.space],
            ].map(
              ([l, v]) =>
                v && (
                  <span
                    key={l}
                    style={{
                      background: C.surfaceAlt,
                      border: `1px solid ${C.border}`,
                      borderRadius: 4,
                      padding: "2px 8px",
                      fontSize: 10,
                    }}
                  >
                    <span style={{ color: C.textMuted }}>{l} </span>
                    <span style={{ color: C.purple }}>{v}</span>
                  </span>
                ),
            )}
          </div>
        )}

        {algo?.category && (
          <Tag color={algo.category === "non-comparison" ? C.amber : C.blue}>
            {algo.category}
          </Tag>
        )}

        {/* Heuristic toggle (A* only) */}
        {category === "path" && algoKey === "astar" && (
          <div style={{ display: "flex", gap: 4, marginLeft: 4 }}>
            <span
              style={{
                fontSize: 10,
                color: C.textMuted,
                alignSelf: "center",
                letterSpacing: ".08em",
              }}
            >
              h(n)
            </span>
            {HEURISTICS.map((h) => (
              <button
                key={h}
                onClick={() =>
                  dispatch({ type: "SET", payload: { heuristic: h } })
                }
                style={{
                  padding: "2px 8px",
                  fontSize: 10,
                  fontFamily: "inherit",
                  borderRadius: 3,
                  cursor: "pointer",
                  border: `1px solid ${heuristic === h ? C.amber : C.border}`,
                  background: heuristic === h ? `${C.amber}20` : "transparent",
                  color: heuristic === h ? C.amber : C.textMuted,
                }}
              >
                {h}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Row 2: algo picker */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {Object.entries(algos).map(([k, a]) => (
          <button
            key={k}
            onClick={() => switchAlgo(k)}
            disabled={running}
            style={{
              padding: "4px 12px",
              fontSize: 11,
              fontFamily: "inherit",
              letterSpacing: ".04em",
              borderRadius: 5,
              cursor: running ? "not-allowed" : "pointer",
              border: `1px solid ${k === algoKey ? C.teal : C.border}`,
              background: k === algoKey ? `${C.teal}18` : "transparent",
              color: k === algoKey ? C.teal : C.textMuted,
              transition: "all .15s",
              opacity: running ? 0.5 : 1,
            }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Info box */}
      {algo?.info && (
        <div
          style={{
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 11,
            color: `${C.text}88`,
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: C.purple, marginRight: 6 }}>what</span>
          {algo.info}
          {algo.why && (
            <>
              <span style={{ color: C.amber, marginLeft: 12, marginRight: 6 }}>
                when
              </span>
              {algo.why}
            </>
          )}
        </div>
      )}
    </div>
  );
}
