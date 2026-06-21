// このデモのルート階層（5 段）の定義。
// URL: /  →  /dashboard  →  /dashboard/teams  →  /dashboard/teams/:teamId  →  /dashboard/teams/:teamId/members
//
// 各階層が loader / action / errorElement を持ち、
// ネストした時に「どの loader が走り」「エラーがどこまで遡って捕捉されるか」を観察する。

export interface LevelDef {
  id: string;
  depth: number;
  title: string;
  /** その階層へのナビゲーション用パス（teamId は demo-1 固定で展開）。 */
  path: string;
}

export const LEVELS: LevelDef[] = [
  { id: "root", depth: 0, title: "Root", path: "/" },
  { id: "dashboard", depth: 1, title: "Dashboard", path: "/dashboard" },
  { id: "teams", depth: 2, title: "Teams", path: "/dashboard/teams" },
  {
    id: "team",
    depth: 3,
    title: "Team detail (:teamId)",
    path: "/dashboard/teams/demo-1",
  },
  {
    id: "members",
    depth: 4,
    title: "Members",
    path: "/dashboard/teams/demo-1/members",
  },
];

export function levelById(id: string): LevelDef {
  const lv = LEVELS.find((l) => l.id === id);
  if (!lv) throw new Error(`unknown level: ${id}`);
  return lv;
}
