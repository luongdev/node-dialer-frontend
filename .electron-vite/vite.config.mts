import {join} from "path";
import {defineConfig} from "vite";
import vuePlugin from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import viteIkarosTools from "./plugin/vite-ikaros-tools";
import {getConfig} from "./utils";

import vueDevTools from 'vite-plugin-vue-devtools'
const devtools = vueDevTools({ componentInspector: false, launchEditor: 'webstorm' });


function resolve(dir: string) {
    return join(__dirname, "..", dir);
}

const config = getConfig();

const root = resolve("src/renderer");

export default defineConfig({
    mode: config && config.NODE_ENV,
    root,
    define: {
        __CONFIG__: config,
        __ISWEB__: Number(config && config.target),
    },
    resolve: {
        alias: {
            "@renderer": root,
            "@layouts": join(root, "/layouts"),
            "@store": join(root, "/store/modules"),
        },
    },
    base: "./",
    build: {
        outDir: config && config.target ? resolve("dist/web") : resolve("dist/electron/renderer"),
        emptyOutDir: true,
        target: "esnext",
        cssCodeSplit: true,
        rollupOptions: {
            input: {
                app: join(root, "index.html"),
                systray: join(root, "systray.html"),
            }
        }
    },
    server: {
    },
    optimizeDeps: {},
    plugins: [vueJsx(), vuePlugin(), viteIkarosTools()],
});
