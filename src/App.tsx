import { useLocation } from "react-router-dom";
import { LevelNav, LevelPanel } from "./components/LevelPanel";
import { LogPanel } from "./components/LogPanel";
import { levelById } from "./lib/levels";

// アプリ全体のシェル（= root ルートの element）。
// ヘッダー / ナビ / 実行ログは常に表示し、main 部分に root の LevelPanel を描画する。
// root の LevelPanel が持つ <Outlet> に dashboard 以下のネストが入る。
export function AppShell() {
  const location = useLocation();

  return (
    <div className="app">
      <header className="app-head">
        <h1>react-router nested loader / action / errorElement デモ</h1>
        <p className="lead">
          URL を深くたどると、各階層の <code>loader</code> /{" "}
          <code>action</code> / <code>errorElement</code> が多段でどう動くかを
          右側の実行ログで観察できます。各パネルの「エラー注入」リンクで、
          任意の階層・フェーズに意図的なエラーを仕込めます。
        </p>
        <LevelNav search={location.search} />
        <ul className="hints">
          <li>
            深い URL へ遷移 → 一致した全階層の loader が
            <b>並列</b>に実行される（ログの開始時刻が近い）。
          </li>
          <li>
            子へ遷移しても、既に実行済みの親 loader は
            <b>再実行されない</b>（runCount が増えない）。
          </li>
          <li>
            いずれかの階層で action(POST) を実行すると、ページ上の
            <b>全 loader が revalidate</b> される（全 runCount が増える）。
          </li>
          <li>
            <code>:teamId</code> 階層だけ errorElement を持たないので、そこで
            起きたエラーは親(teams)へ<b>伝播</b>する。
          </li>
        </ul>
      </header>

      <div className="app-body">
        <main className="app-main">
          <LevelPanel level={levelById("root")} />
        </main>
        <LogPanel />
      </div>
    </div>
  );
}
