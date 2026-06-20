// 各 loader / action / errorElement / コンポーネント描画が「いつ・どの順で」
// 実行されたかを記録する共有ログ。
// React の外側（loader/action は React コンポーネントではない）からも書き込めるよう、
// 単純な pub/sub ストアとして実装している。

export type EventKind = "loader" | "action" | "render" | "error" | "nav";

export interface LogEntry {
  id: number;
  /** 経過時間（ms）。アプリ起動からの相対時刻で、実行順を読みやすくする。 */
  t: number;
  kind: EventKind;
  /** どのルート階層の出来事か（root / dashboard / teams ...）。 */
  routeId: string;
  /** ネストの深さ（インデント表示に使う）。 */
  depth: number;
  message: string;
}

const start = performance.now();
let seq = 0;
let entries: LogEntry[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function logEvent(
  kind: EventKind,
  routeId: string,
  depth: number,
  message: string,
): void {
  entries = [
    ...entries,
    {
      id: ++seq,
      t: Math.round(performance.now() - start),
      kind,
      routeId,
      depth,
      message,
    },
  ];
  // 開発者ツールのコンソールでも追えるようにする。
  // eslint-disable-next-line no-console
  console.log(`[${kind}] ${routeId}: ${message}`);
  emit();
}

export function clearLog(): void {
  entries = [];
  emit();
}

// useSyncExternalStore 用 API
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): LogEntry[] {
  return entries;
}
