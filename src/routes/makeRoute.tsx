import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";
import { logEvent } from "../lib/eventLog";
import { levelById } from "../lib/levels";
import { shouldFault, throwFault } from "../lib/fault";
import { LevelPanel } from "../components/LevelPanel";
import { ErrorPanel } from "../components/ErrorPanel";

// loader が何回走ったかを階層ごとに数える。
// 「子へ遷移しても親 loader は再実行されない」「action 後は全 loader が revalidate される」を
// この回数の増え方で観察できる。
const loaderRunCount: Record<string, number> = {};

export interface LevelLoaderData {
  routeId: string;
  title: string;
  depth: number;
  runCount: number;
  ranAt: string;
  teamId?: string;
}

/** 並列実行を目で見えるようにするための擬似的な遅延。 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function makeRoute(levelId: string) {
  const level = levelById(levelId);

  async function loader({
    request,
    params,
  }: LoaderFunctionArgs): Promise<LevelLoaderData> {
    const url = request.url;
    logEvent("loader", level.id, level.depth, "loader 開始");

    // 階層が深いほど少し遅くする。並列実行されると「開始は同時・完了は別」になるのが見える。
    await delay(120 + level.depth * 80);

    if (shouldFault(url, level.id, "loader")) {
      logEvent("error", level.id, level.depth, "loader で throw");
      throwFault(level.id, "loader");
    }

    loaderRunCount[level.id] = (loaderRunCount[level.id] ?? 0) + 1;
    logEvent(
      "loader",
      level.id,
      level.depth,
      `loader 完了（通算 ${loaderRunCount[level.id]} 回目）`,
    );

    return {
      routeId: level.id,
      title: level.title,
      depth: level.depth,
      runCount: loaderRunCount[level.id],
      ranAt: new Date().toLocaleTimeString("ja-JP"),
      teamId: params.teamId,
    };
  }

  async function action({ request }: ActionFunctionArgs) {
    const url = request.url;
    const form = await request.formData();
    const note = String(form.get("note") ?? "");
    logEvent("action", level.id, level.depth, `action 開始（入力: "${note}"）`);

    await delay(150);

    if (shouldFault(url, level.id, "action")) {
      logEvent("error", level.id, level.depth, "action で throw");
      throwFault(level.id, "action");
    }

    logEvent(
      "action",
      level.id,
      level.depth,
      "action 完了 → この後ページ上の全 loader が revalidate される",
    );

    return {
      ok: true,
      routeId: level.id,
      note,
      doneAt: new Date().toLocaleTimeString("ja-JP"),
    };
  }

  function Component() {
    return <LevelPanel level={level} />;
  }

  function ErrorBoundary() {
    return <ErrorPanel level={level} />;
  }

  return { loader, action, Component, ErrorBoundary };
}
