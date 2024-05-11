import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte()],
    assetsInclude: [
        "**/*.svg",
        "**/*.png",
        "**/*.jpg",
        "**/*.gif",
        "**/*.webp",
        "**/*.z3",
    ],
    base: "https://fortyseven.github.io/zllm/",
    server: {
        host: "0",
    },
});
