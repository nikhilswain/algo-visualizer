import { useStore } from "../../store";
import { COLORS as C } from "../../theme";

const NODE_R = 20;

const NODE_COLORS: Record<string, string> = {
  idle: "#1e1e32",
  comparing: "#4a9eff",
  inserted: "#22d3a5",
  found: "#22d3a5",
  path: "#7c6af7",
  target: "#f5a623",
  rotating: "#f5a623",
  deleted: "#f7694a",
  "not-found": "#f7694a",
  "balance-ok": "#7c6af7",
  swap: "#f7694a",
  "word-end": "#22d3a5",
  included: "#22d3a5",
  excluded: "#1e1e32",
  split: "#4a9eff",
};

const EDGE_COLORS: Record<string, string> = {
  idle: "#1a1a2e",
  traversing: "#4a9eff",
  highlight: "#22d3a5",
};

export default function TreeViz() {
  const { state } = useStore();
  const { treeData, treeNodeColors, treeEdgeColors } = state;
  const { nodes, edges } = treeData;

  if (!nodes.length)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 300,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          color: C.textMuted,
          fontSize: 12,
        }}
      >
        Press Run to build the tree
      </div>
    );

  const getNodeColor = (id: string) =>
    NODE_COLORS[treeNodeColors[id]] || NODE_COLORS.idle;

  const getEdgeColor = (from: string, to: string) => {
    const key = `${from}-${to}`;
    const status = treeEdgeColors[key];
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
        {/* Edges */}
        {edges.map((e) => {
          const a = nodeMap[e.from];
          const b = nodeMap[e.to];
          if (!a || !b) return null;

          const edgeColor = getEdgeColor(e.from, e.to);
          const key = `${e.from}-${e.to}`;
          const status = treeEdgeColors[key] || "";

          return (
            <line
              key={key}
              x1={a.x}
              y1={a.y + NODE_R}
              x2={b.x}
              y2={b.y - NODE_R}
              stroke={edgeColor}
              strokeWidth={status === "highlight" ? 2.5 : status === "traversing" ? 2 : 1.5}
              style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((n) => {
          const fill = getNodeColor(n.id);
          const status = treeNodeColors[n.id] || "";
          const isActive = status === "comparing" || status === "rotating" || status === "swap" || status === "split";
          const displayText = n.label != null ? n.label : n.value;
          const fontSize = n.label != null ? (n.label.length > 3 ? 8 : n.label.length > 2 ? 10 : 12) : (n.value >= 100 ? 10 : 12);

          return (
            <g key={n.id}>
              {/* End-of-word outer ring for Trie */}
              {n.endMarker && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={NODE_R + 4}
                  fill="none"
                  stroke="#22d3a5"
                  strokeWidth={1.5}
                  strokeDasharray="3 2"
                  style={{ transition: "stroke 0.2s" }}
                />
              )}
              <circle
                cx={n.x}
                cy={n.y}
                r={NODE_R}
                fill={fill}
                stroke={fill === NODE_COLORS.idle ? C.border : fill}
                strokeWidth={isActive ? 2.5 : 1.5}
                style={{ transition: "fill 0.2s, stroke 0.2s" }}
              />
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight={600}
                fontFamily="inherit"
                fill={C.text}
              >
                {displayText}
              </text>
              {/* Sublabel below node (e.g., range for segment tree) */}
              {n.sublabel && (
                <text
                  x={n.x}
                  y={n.y + NODE_R + 12}
                  textAnchor="middle"
                  fontSize={8}
                  fontFamily="inherit"
                  fill={C.textMuted}
                >
                  {n.sublabel}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {(
          [
            ["idle", NODE_COLORS.idle],
            ["comparing", NODE_COLORS.comparing],
            ["inserted", NODE_COLORS.inserted],
            ["found", NODE_COLORS.found],
            ["rotating", NODE_COLORS.rotating],
            ["deleted", NODE_COLORS.deleted],
            ["traversing", EDGE_COLORS.traversing],
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
