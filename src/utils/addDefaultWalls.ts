import type { Grid } from "../types";

export function addDefaultWalls(grid: Grid): Grid {
  const g = grid.map((r) => [...r]);
  for (let r = 3; r < 12; r++) if (r !== 7) g[r][8] = "wall";
  for (let c = 12; c < 20; c++) if (c !== 16) g[6][c] = "wall";
  for (let r = 10; r < 16; r++) if (r !== 13) g[r][17] = "wall";
  return g;
}
