import type { ReactNode, CSSProperties } from "react";
import { COLORS as C } from "../../theme";

type BtnProps = {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  danger?: boolean;
  active?: boolean;
  style?: CSSProperties;
};

export function Btn({
  children,
  onClick,
  disabled,
  primary,
  danger,
  active,
  style = {},
}: BtnProps) {
  const variant = primary
    ? "primary"
    : danger
      ? "danger"
      : active
        ? "active"
        : "default";

  const base: CSSProperties = {
    padding: "7px 14px",
    fontSize: 11,
    fontFamily: "inherit",
    fontWeight: 600,
    letterSpacing: ".05em",
    borderRadius: 5,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.38 : 1,
    transition: "all .15s",
  };

  const variants: Record<string, CSSProperties> = {
    primary: {
      border: `1px solid ${C.purple}`,
      background: C.purple,
      color: "#fff",
    },
    danger: {
      border: `1px solid ${C.coral}`,
      background: `${C.coral}20`,
      color: C.coral,
    },
    active: {
      border: `1px solid ${C.teal}`,
      background: `${C.teal}20`,
      color: C.teal,
    },
    default: {
      border: `1px solid ${C.border}`,
      background: "transparent",
      color: C.textMuted,
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...base,
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
