import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages はリポジトリ名のサブパス（/eval-react-router/）配下で配信されるため、
// 本番ビルド時のみ base をリポジトリ名に合わせる。dev / preview ではルート配下。
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/eval-react-router/" : "/",
  plugins: [react()],
  server: {
    port: 5173,
  },
}));
