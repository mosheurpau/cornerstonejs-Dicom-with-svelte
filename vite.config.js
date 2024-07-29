import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import wasm from "@rollup/plugin-wasm";

export default defineConfig({
  plugins: [sveltekit(), wasm()],
  resolve: {
    extensions: [".js", ".ts", ".svelte"], // Ensure it resolves TypeScript files
  },
  optimizeDeps: {
    include: [
      "@cornerstonejs/core",
      "@cornerstonejs/dicom-image-loader",
      "dicomweb-client",
      "dcmjs",
    ],
  },
});
