import { useStore } from "../../store";
import { SORT_ALGOS } from "../../algorithms/sorting";
import { PATH_ALGOS } from "../../algorithms/pathfinding";
import { COLORS, FONT } from "../../theme";
import { keywords, types } from "../../constants";

function tokenize(line) {
  // Very lightweight syntax highlighting

  return line
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(".*?"|'.*?'|`.*?`)/g, `<span style="color:#9fcf7e">$1</span>`)
    .replace(/\/\/.*$/g, `<span style="color:#5a5a7a">$&</span>`)
    .replace(/#.*$/g, `<span style="color:#5a5a7a">$&</span>`)
    .replace(/\b(\d+(?:\.\d+)?)\b/g, `<span style="color:#f5a623">$1</span>`)
    .replace(
      new RegExp(`\\b(${keywords.join("|")})\\b`, "g"),
      `<span style="color:#7c6af7">$1</span>`,
    )
    .replace(
      new RegExp(`\\b(${types.join("|")})\\b`, "g"),
      `<span style="color:#4a9eff">$1</span>`,
    );
}

export default function CodePanel() {
  const { state, dispatch } = useStore();
  const { category, algoKey, lang, activeLine } = state;

  const algo = category === "sort" ? SORT_ALGOS[algoKey] : PATH_ALGOS[algoKey];
  if (!algo?.code) return null;

  const code = algo.code[lang] || algo.code.js;
  const lines = code.split("\n");

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: `1px solid ${COLORS.border}`,
          background: COLORS.bg,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 5 }}>
          {["#f7694a", "#f5a623", "#22d3a5"].map((c, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: c,
              }}
            />
          ))}
        </div>
        <span
          style={{
            fontSize: 10,
            color: COLORS.textMuted,
            fontFamily: "inherit",
          }}
        >
          {algo.title ||
            `${algo.label?.toLowerCase().replace(" ", "_")}.${lang === "py" ? "py" : "js"}`}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {(["js", "py"] as const).map((l) => (
            <button
              key={l}
              onClick={() => dispatch({ type: "SET", payload: { lang: l } })}
              style={{
                padding: "2px 8px",
                fontSize: 10,
                fontFamily: "inherit",
                borderRadius: 3,
                cursor: "pointer",
                border: `1px solid ${lang === l ? COLORS.purple : COLORS.border}`,
                background: lang === l ? `${COLORS.purple}30` : "transparent",
                color: lang === l ? COLORS.purple : COLORS.textMuted,
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Code body */}
      <div
        style={{
          overflowY: "auto",
          overflowX: "auto",
          flex: 1,
          padding: "8px 0",
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "stretch",
              borderLeft: `2px solid ${i === activeLine ? COLORS.purple : "transparent"}`,
              background:
                i === activeLine ? `${COLORS.purple}14` : "transparent",
              transition: "background .15s, border-color .15s",
            }}
          >
            <span
              style={{
                width: 32,
                textAlign: "right",
                padding: "0 8px 0 0",
                fontSize: 11,
                lineHeight: "1.85",
                color: i === activeLine ? COLORS.purple : COLORS.textDim,
                userSelect: "none",
                flexShrink: 0,
                fontFamily: FONT?.mono || "monospace",
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                fontSize: 11,
                lineHeight: "1.85",
                padding: "0 12px 0 0",
                whiteSpace: "pre",
                color: i === activeLine ? COLORS.text : `${COLORS.text}99`,
                fontFamily: "inherit",
                transition: "color .15s",
              }}
              dangerouslySetInnerHTML={{ __html: tokenize(line) }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
