import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  preview: {
    port: 3000,
    host: "0.0.0.0",
  },
});
```

Commit changes ✅

---

## What changed
- Removed `PORT` requirement — hardcoded `3000` instead
- Removed `BASE_PATH` requirement
- Removed all Replit-specific plugins (`runtimeErrorOverlay`, `cartographer`)
- Kept all the important stuff intact

---

## Also check translation-hub

It probably has the same `vite.config.ts` issue. Go to:
```
artifacts/translation-hub/vite.config.ts
