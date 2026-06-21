# eval-react-router

react-router v8（data router / `createBrowserRouter`）の **loader / action / errorElement** が、
URL を多段にネストしたときにどう動くかを観察するためのデモアプリです。

5 段にネストしたルートを用意し、各階層に loader・action・errorElement を持たせています。
画面右側の **実行ログ（時系列）** に、どの loader/action がいつ実行され、エラーがどこで捕捉されたかが出ます。

🔗 **公開デモ（GitHub Pages）**: https://hidekingerz.github.io/eval-react-router/

## セットアップ

Node のバージョンは [mise](https://mise.jdx.dev/) で管理しています（`mise.toml` で最新 LTS を指定）。

```bash
mise install    # mise.toml の Node（最新 LTS）を導入
npm install
npm run dev      # http://localhost:5173
```

その他のスクリプト:

```bash
npm run build      # tsc 型チェック + 本番ビルド
npm run preview    # ビルド結果をプレビュー
npm run typecheck  # 型チェックのみ
```

## GitHub Pages へのデプロイ

`main` ブランチへ push すると、GitHub Actions（`.github/workflows/deploy.yml`）が
ビルドして GitHub Pages へ自動デプロイします。公開 URL は次の通りです。

```
https://hidekingerz.github.io/eval-react-router/
```

初回のみ、リポジトリの **Settings → Pages → Build and deployment** で
**Source** を **GitHub Actions** に設定してください。

仕組み:

- `vite.config.ts` … 本番ビルド時のみ `base` をリポジトリ名（`/eval-react-router/`）に設定。
- `src/router.tsx` … `createBrowserRouter` の `basename` に `import.meta.env.BASE_URL` を渡し、サブパス配下でルーティングが成立するようにする。
- ワークフロー … ビルド後に `index.html` を `404.html` へコピー。GitHub Pages は未知パスで `404.html` を返すため、ディープリンク（例 `/eval-react-router/dashboard/teams`）でもアプリが起動し react-router が解決する。

## ルート構成

| URL | id | loader | action | errorElement |
| --- | --- | :---: | :---: | :---: |
| `/` | root | ✅ | ✅ | ✅ |
| `/dashboard` | dashboard | ✅ | ✅ | ✅ |
| `/dashboard/teams` | teams | ✅ | ✅ | ✅ |
| `/dashboard/teams/:teamId` | team | ✅ | ✅ | ❌（意図的に無し） |
| `/dashboard/teams/:teamId/members` | members | ✅ | ✅ | ✅ |

`:teamId` は `demo-1` で展開しています。`team` 階層だけ errorElement を持たないのは、
**errorElement が無い階層のエラーが親へ伝播する** 挙動を見せるためです。

## 観察できること

### 1. loader は一致した全階層が「並列」に実行される

深い URL（例 `/dashboard/teams/demo-1/members`）に直接遷移すると、
`root → dashboard → teams → team → members` の loader が**同時に開始**されます
（ログの開始時刻が近接）。react-router は親→子を直列に待たず、まとめて並列実行します。
各 loader には深さに応じた擬似遅延を入れてあるので、開始は同時・完了はバラバラになるのが見えます。

### 2. 既に実行済みの親 loader は再実行されない

`/dashboard` 表示後に `/dashboard/teams` へ遷移しても、root/dashboard の loader は再実行されません
（`runCount` が増えない）。新しく一致した teams の loader だけが走ります。

### 3. action(POST) 実行後はページ上の全 loader が revalidate される

どの階層の「POST submit」ボタンを押しても、その階層の action が実行され、
**完了後にページ上の全 loader が再実行**されます（全階層の `runCount` が増える）。
これが react-router のデフォルトの revalidation です。

### 4. errorElement はエラーの起きた階層に表示され、親 UI は残る

各パネルの「エラー注入」リンクで、`loader` / `action` / `render` のいずれかを
意図的に失敗させられます（URL の `?error=<id>:<phase>` を切り替えているだけ）。

- **loader でエラー** → その階層の loader データが用意できないため、その階層の Outlet 以下が
  errorElement に置き換わる。親階層のパネルはそのまま残る。
- **render でエラー** → 描画中の例外も同じ errorElement が捕捉する。
- **action でエラー** → action から throw された値も errorElement が捕捉する。

### 5. errorElement の無い階層はエラーが親へ伝播する

`:teamId`（team）階層には errorElement がありません。
team の loader/action/render でエラーを起こすと、最も近い祖先の errorElement である
**teams の errorElement** が捕捉します。これが「多段での errorElement の探索（バブリング）」です。

## エラー注入を URL で直接指定する

UI のリンクを使わず、URL に直接書いても切り替えられます（カンマ区切りで複数可）。

```
/dashboard/teams                 ?error=teams:loader   … teams の loader を失敗
/dashboard/teams/demo-1          ?error=team:render    … team の render を失敗 → teams へ伝播
/dashboard/teams/demo-1/members  ?error=members:loader,teams:render
```

## 構成ファイル

- `src/router.tsx` … ネストしたルート定義（どこに errorElement を付けるか）
- `src/routes/makeRoute.tsx` … 各階層の loader / action / Component / ErrorBoundary を生成
- `src/components/LevelPanel.tsx` … 各階層のパネル UI（loader データ表示・エラー注入・action フォーム）
- `src/components/ErrorPanel.tsx` … errorElement（`useRouteError`）
- `src/components/LogPanel.tsx` … 実行ログの時系列表示
- `src/lib/eventLog.ts` … loader/action/error の実行を記録する共有ログ
- `src/lib/fault.ts` … `?error=` パラメータによるエラー注入
- `src/lib/levels.ts` … 5 段の階層定義
