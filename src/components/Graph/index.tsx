import { useStore } from "../../store";
import { COLORS as C } from "../../theme";

const NODE_R = 20;

const NODE_COLORS: Record<string, string> = {
  idle: "#1e1e32",
  visiting: "#4a9eff",
  visited: "#7c6af7",
  result: "#22d3a5",
  cycle: "#f7694a",
};

const EDGE_COLORS: Record<string, string> = {
  idle: "#1a1a2e",
  considering: "#f5a623",
  included: "#22d3a5",
  rejected: "rgba(247,105,74,0.25)",
};

export default function GraphViz() {
  const { state } = useStore();
  const { graphData, graphNodeColors, graphEdgeColors } = state;
  const { nodes, edges } = graphData;

  if (!nodes.length) return null;

  const getNodeColor = (id: string) =>
    NODE_COLORS[graphNodeColors[id]] || NODE_COLORS.idle;

  const getEdgeColor = (from: string, to: string) => {
    const key = `${from}-${to}`;
    const revKey = `${to}-${from}`;
    const status = graphEdgeColors[key] || graphEdgeColors[revKey];
    return EDGE_COLORS[status] || EDGE_COLORS.idle;
  };

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg
        viewBox="0 0 760 460"
        style={{
          width: "100%",
          maxWidth: 880,
          margin: "0 auto",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
        }}
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 7"
            refX="10"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 3.5 L 0 7 z" fill={C.textMuted} />
          </marker>
          <marker
            id="arrow-considering"
            viewBox="0 0 10 7"
            refX="10"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 3.5 L 0 7 z" fill={EDGE_COLORS.considering} />
          </marker>
          <marker
            id="arrow-included"
            viewBox="0 0 10 7"
            refX="10"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 3.5 L 0 7 z" fill={EDGE_COLORS.included} />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((e) => {
          const a = nodeMap[e.from];
          const b = nodeMap[e.to];
          if (!a || !b) return null;

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const nx = dx / dist;
          const ny = dy / dist;

          const x1 = a.x + nx * NODE_R;
          const y1 = a.y + ny * NODE_R;
          const x2 = b.x - nx * NODE_R;
          const y2 = b.y - ny * NODE_R;

          const edgeColor = getEdgeColor(e.from, e.to);
          const edgeKey = `${e.from}-${e.to}`;
          const status =
            graphEdgeColors[edgeKey] ||
            graphEdgeColors[`${e.to}-${e.from}`] ||
            "";

          let markerEnd = "";
          if (e.directed) {
            if (status === "considering") markerEnd = "url(#arrow-considering)";
            else if (status === "included") markerEnd = "url(#arrow-included)";
            else markerEnd = "url(#arrow)";
          }

          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;

          return (
            <g key={edgeKey}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={edgeColor}
                strokeWidth={
                  status === "included"
                    ? 3
                    : status === "considering"
                      ? 2.5
                      : 1.5
                }
                markerEnd={markerEnd}
                style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
              />
              {e.weight !== undefined && (
                <text
                  x={mx}
                  y={my - 8}
                  textAnchor="middle"
                  fontSize={11}
                  fontFamily="inherit"
                  fill={
                    status === "included"
                      ? EDGE_COLORS.included
                      : status === "considering"
                        ? EDGE_COLORS.considering
                        : C.textMuted
                  }
                  style={{ transition: "fill 0.2s" }}
                >
                  {e.weight}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((n) => {
          const fill = getNodeColor(n.id);
          return (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={NODE_R}
                fill={fill}
                stroke={fill === NODE_COLORS.idle ? C.border : fill}
                strokeWidth={1.5}
                style={{ transition: "fill 0.2s, stroke 0.2s" }}
              />
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                fontSize={12}
                fontWeight={600}
                fontFamily="inherit"
                fill={C.text}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {(
          [
            ["idle", NODE_COLORS.idle],
            ["visiting", NODE_COLORS.visiting],
            ["visited", NODE_COLORS.visited],
            ["result", NODE_COLORS.result],
            ["cycle", NODE_COLORS.cycle],
            ["considering", EDGE_COLORS.considering],
            ["included", EDGE_COLORS.included],
            ["rejected", EDGE_COLORS.rejected],
          ] as const
        ).map(([l, bg]) => (
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
