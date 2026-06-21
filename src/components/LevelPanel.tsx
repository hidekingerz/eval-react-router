import {
  Form,
  Link,
  Outlet,
  useActionData,
  useLoaderData,
  useLocation,
  useNavigation,
} from "react-router";
import type { LevelDef } from "../lib/levels";
import { LEVELS } from "../lib/levels";
import type { LevelLoaderData } from "../routes/makeRoute";
import { getFaults, shouldFault } from "../lib/fault";

interface ActionResult {
  ok: boolean;
  routeId: string;
  note: string;
  doneAt: string;
}

// 現在の error パラメータをトグルした検索文字列を作る。
// これで「この階層の loader を落とす」リンクをワンクリックで切り替えられる。
function toggledSearch(currentSearch: string, key: string): string {
  const faults = getFaults(`?${new URLSearchParams(currentSearch).toString()}`);
  if (faults.has(key)) faults.delete(key);
  else faults.add(key);
  const params = new URLSearchParams();
  if (faults.size > 0) params.set("error", [...faults].join(","));
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function LevelPanel({ level }: { level: LevelDef }) {
  const data = useLoaderData() as LevelLoaderData;
  const actionData = useActionData() as ActionResult | undefined;
  const location = useLocation();
  const navigation = useNavigation();

  // 描画フェーズでのエラー注入。errorElement がレンダリング例外も捕捉することを示す。
  if (shouldFault(location.search, level.id, "render")) {
    throw new Error(
      `[${level.id}] の render で意図的にエラーを発生させました（?error=${level.id}:render）`,
    );
  }

  const search = location.search;
  const faultActive = (phase: string) =>
    shouldFault(search, level.id, phase as never);

  return (
    <section className={`panel depth-${level.depth}`}>
      <header className="panel-head">
        <span className="badge">depth {level.depth}</span>
        <h2>{level.title}</h2>
        <code>{level.id}</code>
      </header>

      <div className="loader-data">
        <strong>loader データ:</strong> runCount=
        <b>{data.runCount}</b> / ranAt={data.ranAt}
        {data.teamId ? ` / teamId=${data.teamId}` : ""}
      </div>

      {actionData?.ok && actionData.routeId === level.id && (
        <div className="action-data">
          action 完了: note="{actionData.note}" ({actionData.doneAt})
        </div>
      )}

      <div className="controls">
        <div className="control-group">
          <span className="control-label">エラー注入（この階層）:</span>
          {(["loader", "action", "render"] as const).map((phase) => (
            <Link
              key={phase}
              to={location.pathname + toggledSearch(search, `${level.id}:${phase}`)}
              className={faultActive(phase) ? "chip chip-on" : "chip"}
            >
              {phase} {faultActive(phase) ? "ON" : "off"}
            </Link>
          ))}
        </div>

        <Form method="post" className="action-form">
          <span className="control-label">action 実行:</span>
          <input name="note" placeholder="メモを入力" defaultValue="hello" />
          <button type="submit" disabled={navigation.state === "submitting"}>
            {navigation.state === "submitting" ? "送信中…" : "POST submit"}
          </button>
        </Form>
      </div>

      {/* ネストした子ルートはここに描画される */}
      <div className="outlet">
        <Outlet />
      </div>
    </section>
  );
}

// ナビゲーション用に全階層へのリンクを並べる小さなヘルパー（Root で使用）。
export function LevelNav({ search }: { search: string }) {
  return (
    <nav className="level-nav">
      {LEVELS.map((lv) => (
        <Link key={lv.id} to={lv.path + search}>
          {lv.path}
        </Link>
      ))}
    </nav>
  );
}
