import { useEffect } from "react";
import { useStore } from "./store";
import { useVisualizer } from "./hooks/useVisualizer";
import TopBar from "./components/Layout/TopBar";
import StatsBar from "./components/Layout/StatsBar";
import SortLegend from "./components/Layout/SortLegend";
import Narrator from "./components/Narrator";
import Controls from "./components/Controls";
import SortBars from "./components/Bars";
import GridViz from "./components/Grid";
import CodePanel from "./components/CodePanel";
import { COLORS as C, FONT as F } from "./theme";

function Inner() {
  const { state } = useStore();
  const { initSort } = useVisualizer();
  const { category } = state;

  useEffect(() => {
    initSort("bubble");
  }, [initSort]);

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        color: C.text,
        fontFamily: F?.mono || "'JetBrains Mono', monospace",
        display: "flex",
        flexDirection: "column",
        padding: "16px 20px",
        gap: 12,
        boxSizing: "border-box",
      }}
    >
      <TopBar />

      <Narrator />

      <StatsBar />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: 12,
          flex: 1,
          minHeight: 0,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {category === "sort" ? <SortBars /> : <GridViz />}
          {category === "sort" && <SortLegend />}
        </div>

        <div style={{ minHeight: category === "sort" ? 260 : 400 }}>
          <CodePanel />
        </div>
      </div>

      <Controls />

      <div
        style={{
          fontSize: 9,
          color: C.textDim,
          textAlign: "center",
          letterSpacing: ".08em",
        }}
      >
        SPACE · play/pause &nbsp;|&nbsp; → · step &nbsp;|&nbsp; ESC · reset
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Inner />
    </>
  );
}
