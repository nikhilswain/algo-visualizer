import { useStore } from "../../store";
import { useVisualizer } from "../../hooks/useVisualizer";
import { COLORS as C } from "../../theme";
import { makeGrid } from "../../utils/makeGrid";
import { addDefaultWalls } from "../../utils/addDefaultWalls";
import { GRID_COLS_N, GRID_ROWS_N } from "../../constants";
import { Btn } from "../ui/Button";

const PRESETS = {
  clear: { label: "Clear", build: () => makeGrid() },
  default: { label: "Default", build: () => addDefaultWalls(makeGrid()) },
  maze: {
    label: "Maze",
    build: () => {
      const g = makeGrid();
      for (let r = 1; r < GRID_ROWS_N - 1; r++)
        for (let c = 1; c < GRID_COLS_N - 1; c++)
          if ((r % 2 === 0 || c % 2 === 0) && Math.random() > 0.3)
            g[r][c] = "wall";
      return g;
    },
  },
  dense: {
    label: "Dense",
    build: () => {
      const g = makeGrid();
      for (let r = 0; r < GRID_ROWS_N; r++)
        for (let c = 0; c < GRID_COLS_N; c++)
          if (Math.random() < 0.38) g[r][c] = "wall";
      return g;
    },
  },
  weights: {
    label: "Weights",
    build: () => {
      const g = makeGrid();
      for (let r = 0; r < GRID_ROWS_N; r++)
        for (let c = 0; c < GRID_COLS_N; c++)
          if (Math.random() < 0.25) g[r][c] = "weight";
      return g;
    },
  },
};

export default function Controls() {
  const { state, dispatch } = useStore();
  const { run, pause, stop, stepOnce } = useVisualizer();
  const { running, paused, speed, category } = state;

  const applyPreset = (key) => {
    const g = PRESETS[key].build();
    dispatch({ type: "SET_GRID", payload: g });
    dispatch({ type: "RESET_GRID_COLORS" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Main controls */}
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {!running ? (
          <Btn primary onClick={run}>
            ▶ run
          </Btn>
        ) : (
          <Btn active onClick={pause}>
            {paused ? "▶  resume" : "⏸  pause"}
          </Btn>
        )}
        <Btn onClick={stepOnce} disabled={running && !paused}>
          → step
        </Btn>
        <Btn danger onClick={stop}>
          ↺ reset
        </Btn>

        {/* Speed */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginLeft: 4,
          }}
        >
          <span
            style={{ fontSize: 10, color: C.textMuted, letterSpacing: ".06em" }}
          >
            SPEED
          </span>
          <input
            type="range"
            min="1"
            max="20"
            value={speed}
            step="1"
            onChange={(e) =>
              dispatch({ type: "SET", payload: { speed: +e.target.value } })
            }
            style={{ width: 80, accentColor: C.purple }}
          />
          <span
            style={{
              fontSize: 11,
              color: C.purple,
              minWidth: 22,
              textAlign: "right",
              fontFamily: "inherit",
            }}
          >
            {speed}×
          </span>
        </div>

        <span
          style={{
            fontSize: 9,
            color: C.textDim,
            marginLeft: "auto",
            letterSpacing: ".06em",
          }}
        >
          SPACE play · → step · ESC reset
        </span>
      </div>

      {/* Presets (path only) */}
      {category === "path" && (
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: C.textMuted,
              letterSpacing: ".1em",
              textTransform: "uppercase",
            }}
          >
            Presets
          </span>
          {Object.entries(PRESETS).map(([k, p]) => (
            <button
              key={k}
              onClick={() => applyPreset(k)}
              disabled={running}
              style={{
                padding: "3px 10px",
                fontSize: 11,
                fontFamily: "inherit",
                borderRadius: 4,
                cursor: running ? "not-allowed" : "pointer",
                border: `1px solid ${C.border}`,
                background: "transparent",
                color: C.textMuted,
                opacity: running ? 0.4 : 1,
                transition: "all .15s",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
