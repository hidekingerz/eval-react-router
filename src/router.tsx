import { createBrowserRouter } from "react-router";
import { AppShell } from "./App";
import { makeRoute } from "./routes/makeRoute";

// 各階層の loader / action / Component / ErrorBoundary を生成。
const root = makeRoute("root");
const dashboard = makeRoute("dashboard");
const teams = makeRoute("teams");
const team = makeRoute("team");
const members = makeRoute("members");

// ネスト構成:
//  /                                  root        (errorElement あり / element は AppShell)
//   └ dashboard                       dashboard   (errorElement あり)
//       └ teams                       teams       (errorElement あり)
//           └ :teamId                 team        (errorElement なし → 親 teams へ伝播)
//               └ members             members     (errorElement あり)
export const router = createBrowserRouter([
  {
    path: "/",
    id: "root",
    element: <AppShell />,
    loader: root.loader,
    action: root.action,
    errorElement: <root.ErrorBoundary />,
    children: [
      {
        path: "dashboard",
        id: "dashboard",
        Component: dashboard.Component,
        loader: dashboard.loader,
        action: dashboard.action,
        errorElement: <dashboard.ErrorBoundary />,
        children: [
          {
            path: "teams",
            id: "teams",
            Component: teams.Component,
            loader: teams.loader,
            action: teams.action,
            errorElement: <teams.ErrorBoundary />,
            children: [
              {
                path: ":teamId",
                id: "team",
                Component: team.Component,
                loader: team.loader,
                action: team.action,
                // errorElement を意図的に付けない。
                // この階層のエラーは親 teams の errorElement に伝播する。
                children: [
                  {
                    path: "members",
                    id: "members",
                    Component: members.Component,
                    loader: members.loader,
                    action: members.action,
                    errorElement: <members.ErrorBoundary />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
