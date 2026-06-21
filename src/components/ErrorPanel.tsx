import { useEffect } from "react";
import {
  Link,
  isRouteErrorResponse,
  useLocation,
  useRouteError,
} from "react-router";
import type { LevelDef } from "../lib/levels";
import { logEvent } from "../lib/eventLog";

// errorElement（data router におけるエラー表示）。
// useRouteError() で、loader / action / render のいずれで throw された値でも受け取れる。
export function ErrorPanel({ level }: { level: LevelDef }) {
  const error = useRouteError();
  const location = useLocation();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : String(error);

  useEffect(() => {
    logEvent(
      "error",
      level.id,
      level.depth,
      `errorElement が捕捉して描画: ${message}`,
    );
  }, [level.id, level.depth, message]);

  // error パラメータを取り除いた URL（エラーを解除して戻るため）。
  const params = new URLSearchParams(location.search);
  params.delete("error");
  const cleanSearch = params.toString();

  return (
    <section className={`panel error-panel depth-${level.depth}`}>
      <header className="panel-head">
        <span className="badge badge-error">errorElement</span>
        <h2>{level.title} の errorElement が捕捉</h2>
        <code>{level.id}</code>
      </header>
      <p className="error-message">{message}</p>
      <p className="error-note">
        この階層（またはより深い、errorElement を持たない子階層）で発生した
        エラーがここに表示されています。親階層の UI はそのまま残り、
        この階層の Outlet 以下だけがこのエラー表示に置き換わります。
      </p>
      <Link to={location.pathname + (cleanSearch ? `?${cleanSearch}` : "")}>
        エラーを解除して再表示
      </Link>
    </section>
  );
}
