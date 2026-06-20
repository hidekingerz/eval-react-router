import { useSyncExternalStore } from "react";
import {
  clearLog,
  getSnapshot,
  subscribe,
  type EventKind,
} from "../lib/eventLog";

const kindLabel: Record<EventKind, string> = {
  loader: "LOADER",
  action: "ACTION",
  render: "RENDER",
  error: "ERROR",
  nav: "NAV",
};

// 共有イベントログを時系列で表示する。
// loader/action の実行順・並列性・revalidate・エラー伝播がここで読み取れる。
export function LogPanel() {
  const entries = useSyncExternalStore(subscribe, getSnapshot);

  return (
    <aside className="log-panel">
      <div className="log-head">
        <h3>実行ログ（時系列）</h3>
        <button onClick={() => clearLog()}>クリア</button>
      </div>
      <ol className="log-list">
        {entries.length === 0 && (
          <li className="log-empty">
            ここに loader / action / errorElement の実行が時系列で出ます。
          </li>
        )}
        {entries.map((e) => (
          <li key={e.id} className={`log-item kind-${e.kind}`}>
            <span className="log-time">+{e.t}ms</span>
            <span className="log-kind">{kindLabel[e.kind]}</span>
            <span className="log-route" style={{ paddingLeft: e.depth * 12 }}>
              {e.routeId}
            </span>
            <span className="log-msg">{e.message}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
