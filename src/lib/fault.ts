// エラー注入の仕組み。
// URL の検索パラメータ `?error=<routeId>:<phase>` を見て、
// 指定された階層・フェーズで意図的に例外を投げる。
// 複数指定はカンマ区切り（例: ?error=teams:loader,members:render）。
//
// phase は loader / action / render の 3 種類。
// これにより「teams の loader が落ちたら errorElement はどこに出るか」等を URL だけで切り替えられる。

export type Phase = "loader" | "action" | "render";

export function getFaults(url: string): Set<string> {
  const search = url.includes("?") ? url.slice(url.indexOf("?")) : "";
  const params = new URLSearchParams(search);
  const raw = params.get("error") ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

export function shouldFault(url: string, routeId: string, phase: Phase): boolean {
  return getFaults(url).has(`${routeId}:${phase}`);
}

/**
 * loader/action 内でエラーを投げる。
 * react-router では throw した値が errorElement 側の useRouteError() で受け取れる。
 * ここでは「どの種類のエラーがどう伝播するか」を見せるため Error を投げる。
 */
export function throwFault(routeId: string, phase: Phase): never {
  throw new Error(
    `[${routeId}] の ${phase} で意図的にエラーを発生させました（?error=${routeId}:${phase}）`,
  );
}
