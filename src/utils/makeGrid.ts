import { GRID_COLS, GRID_ROWS } from "../constants";
import type { Grid } from "../types";

export function makeGrid(): Grid {
  return Array.from({ length: GRID_ROWS }, () =>
    Array(GRID_COLS).fill("empty"),
  );
}
