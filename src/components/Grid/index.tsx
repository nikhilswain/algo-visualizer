import { useRef, useState, useCallback } from "react";
import { useStore } from "../../store";
import { COLORS as C } from "../../theme";
import { GRID_COLS_N, GRID_ROWS_N } from "../../constants";

const CELL_COLORS = {
  empty: C.surface,
  wall: "#06060e",
  weight: "#1a2a0e",
  visited: "#1a1a52",
  frontier: "#2d1a6a",
  path: C.purple,
  start: C.teal,
  end: C.coral,
};

function getCellBg(
  r,
  c,
  grid,
  gridColors,
  pathStart,
  pathEnd,
  showHeatmap,
  heatmap,
  maxH,
) {
  if (r === pathStart[0] && c === pathStart[1]) return CELL_COLORS.start;
  if (r === pathEnd[0] && c === pathEnd[1]) return CELL_COLORS.end;
  const overlay = gridColors[r]?.[c];
  if (overlay && overlay !== "empty")
    return CELL_COLORS[overlay] || CELL_COLORS.empty;
  if (grid[r][c] === "wall") return CELL_COLORS.wall;
  if (grid[r][c] === "weight") return CELL_COLORS.weight;
  if (showHeatmap && heatmap && maxH > 0) {
    const h = heatmap[r]?.[c] ?? 0;
    const t = 1 - h / maxH;
    const r255 = Math.round(30 + t * 80);
    const b255 = Math.round(50 + t * 150);
    return `rgb(${r255},20,${b255})`;
  }
  return CELL_COLORS.empty;
}

export default function GridViz() {
  const { state, dispatch } = useStore();
  const {
    grid,
    gridColors,
    pathStart,
    pathEnd,
    running,
    heatmap,
    inspectedCell,
    cellData,
  } = state;
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [drawTool, setDrawTool] = useState("wall"); // 'wall' | 'weight' | 'erase'
  const drawRef = useRef(null);

  const maxH = heatmap ? Math.max(...heatmap.flat()) : 1;

  const applyDraw = useCallback(
    (r, c, tool) => {
      if (r === pathStart[0] && c === pathStart[1]) return;
      if (r === pathEnd[0] && c === pathEnd[1]) return;
      const val = tool === "erase" ? "empty" : tool;
      dispatch({ type: "SET_CELL", r, c, val });
    },
    [pathStart, pathEnd, dispatch],
  );

  const startDraw = useCallback(
    (r, c, e) => {
      if (running) return;
      e.preventDefault();

      if (r === pathStart[0] && c === pathStart[1]) {
        drawRef.current = "start";
        return;
      }
      if (r === pathEnd[0] && c === pathEnd[1]) {
        drawRef.current = "end";
        return;
      }

      drawRef.current = drawTool;
      applyDraw(r, c, drawTool);
    },
    [running, pathStart, pathEnd, drawTool, applyDraw],
  );

  const onEnter = useCallback(
    (r, c) => {
      if (!drawRef.current) return;
      if (drawRef.current === "start") {
        dispatch({ type: "SET_PATH_ENDS", start: [r, c] });
        return;
      }
      if (drawRef.current === "end") {
        dispatch({ type: "SET_PATH_ENDS", end: [r, c] });
        return;
      }
      applyDraw(r, c, drawRef.current);
    },
    [applyDraw, dispatch],
  );

  const onMouseUp = useCallback(() => {
    drawRef.current = null;
  }, []);

  const onCellClick = useCallback(
    (r, c) => {
      if (running) {
        dispatch({ type: "SET_INSPECTED", payload: [r, c] });
      }
    },
    [running, dispatch],
  );

  const cd = inspectedCell
    ? cellData[`${inspectedCell[0]},${inspectedCell[1]}`]
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Toolbar */}
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
          Draw
        </span>
        {["wall", "weight", "erase"].map((t) => (
          <button
            key={t}
            onClick={() => setDrawTool(t)}
            style={{
              padding: "3px 10px",
              fontSize: 11,
              fontFamily: "inherit",
              borderRadius: 4,
              cursor: "pointer",
              border: `1px solid ${drawTool === t ? C.purple : C.border}`,
              background: drawTool === t ? `${C.purple}20` : "transparent",
              color: drawTool === t ? C.purple : C.textMuted,
            }}
          >
            {t}
          </button>
        ))}
        <div
          style={{
            width: 1,
            height: 16,
            background: C.border,
            margin: "0 4px",
          }}
        />
        <button
          onClick={() => setShowHeatmap((v) => !v)}
          style={{
            padding: "3px 10px",
            fontSize: 11,
            fontFamily: "inherit",
            borderRadius: 4,
            cursor: "pointer",
            border: `1px solid ${showHeatmap ? C.amber : C.border}`,
            background: showHeatmap ? `${C.amber}20` : "transparent",
            color: showHeatmap ? C.amber : C.textMuted,
          }}
        >
          heatmap {showHeatmap ? "on" : "off"}
        </button>
        <span style={{ fontSize: 10, color: C.textMuted, marginLeft: "auto" }}>
          drag to draw · drag dots to move
        </span>
      </div>

      {/* Grid */}
      <div
        onMouseLeave={onMouseUp}
        onMouseUp={onMouseUp}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_COLS_N}, 1fr)`,
          gap: 1.5,
          background: "#06060e",
          borderRadius: 8,
          padding: 6,
          border: `1px solid ${C.border}`,
          userSelect: "none",
          cursor: drawTool === "erase" ? "crosshair" : "cell",
        }}
      >
        {Array.from({ length: GRID_ROWS_N }, (_, r) =>
          Array.from({ length: GRID_COLS_N }, (_, c) => {
            const isS = r === pathStart[0] && c === pathStart[1];
            const isE = r === pathEnd[0] && c === pathEnd[1];
            const isInsp =
              inspectedCell && inspectedCell[0] === r && inspectedCell[1] === c;
            const bg = getCellBg(
              r,
              c,
              grid,
              gridColors,
              pathStart,
              pathEnd,
              showHeatmap,
              heatmap,
              maxH,
            );
            return (
              <div
                key={`${r}-${c}`}
                onMouseDown={(e) => startDraw(r, c, e)}
                onMouseEnter={() => onEnter(r, c)}
                onClick={() => onCellClick(r, c)}
                style={{
                  paddingTop: "100%",
                  background: bg,
                  borderRadius: isS || isE ? "50%" : 2,
                  transition: "background .1s ease",
                  border: isInsp ? `1px solid ${C.amber}` : "none",
                  cursor: isS || isE ? "grab" : undefined,
                  position: "relative",
                }}
              />
            );
          }),
        )}
      </div>

      {/* Cell inspector */}
      {inspectedCell && cd && (
        <div
          style={{
            background: C.surfaceAlt,
            border: `1px solid ${C.amber}44`,
            borderRadius: 6,
            padding: "8px 12px",
            fontSize: 11,
            fontFamily: "inherit",
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <span style={{ color: C.amber }}>
            inspector → ({inspectedCell[0]},{inspectedCell[1]})
          </span>
          <span>
            g<span style={{ color: C.teal }}> {cd.g?.toFixed(1) ?? "-"}</span>
          </span>
          <span>
            h<span style={{ color: C.purple }}> {cd.h?.toFixed(1) ?? "-"}</span>
          </span>
          <span>
            f<span style={{ color: C.coral }}> {cd.f?.toFixed(1) ?? "-"}</span>
          </span>
          <button
            onClick={() => dispatch({ type: "SET_INSPECTED", payload: null })}
            style={{
              marginLeft: "auto",
              fontSize: 10,
              border: "none",
              background: "transparent",
              color: C.textMuted,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          ["start", C.teal],
          ["end", C.coral],
          ["wall", "#06060e"],
          ["weight ×3", "#1a2a0e"],
          ["visited", "#1a1a52"],
          ["frontier", "#2d1a6a"],
          ["path", C.purple],
        ].map(([l, bg]) => (
          <div
            key={l}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                background: bg,
                borderRadius: 2,
                border: `1px solid ${C.border}`,
              }}
            />
            <span style={{ fontSize: 10, color: C.textMuted }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
