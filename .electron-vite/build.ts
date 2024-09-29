process.env.NODE_ENV = "production";

import { join } from "path";
import { cpSync } from "fs";
import { deleteAsync } from "del";
import chalk from "chalk";
import { rollup, OutputOptions } from "rollup";
import { Listr } from "listr2";
import rollupOptions from "./rollup.config";
import { errorLog, doneLog } from "./log";

const mainOpt = rollupOptions(process.env.NODE_ENV, "main");
const preloadOpt = rollupOptions(process.env.NODE_ENV, "preload");

if (process.env.BUILD_TARGET === "web") web();
else unionBuild();

async function clean() {
  await deleteAsync([
    "dist/electron/main/*",
    "dist/electron/renderer/*",
    "dist/web/*",
    "build/*",
    "!build/icons",
    "!build/lib",
    "!build/lib/electron-build.*",
    "!build/icons/icon.*",
  ]);
  doneLog(`clear done`);
  if (process.env.BUILD_TARGET === "onlyClean") process.exit();
}

async function unionBuild() {
  await clean();

  const tasksLister = new Listr(
    [
      // {
      //   title: "copy assets to build dir",
      //   task: async () => {
      //     cpSync(join(__dirname, '..', 'assets'), join(__dirname, '..', 'build', 'assets'), { recursive: true });
      //   },
      // },
      {
        title: "building main process",
        task: async () => {
          try {
            const build = await rollup(mainOpt);
            await build.write(mainOpt.output as OutputOptions);
          } catch (error) {
            errorLog(`failed to build main process\n`);
            return Promise.reject(error);
          }
        },
      },
      {
        title: "building preload process",
        task: async () => {
          try {
            const build = await rollup(preloadOpt);
            await build.write(preloadOpt.output as OutputOptions);
          } catch (error) {
            errorLog(`failed to build main process\n`);
            return Promise.reject(error);
          }
        },
      },
      {
        title: "building renderer process",
        task: async (_, tasks) => {
          try {
            const { build } = await import("vite");
            await build({ configFile: join(__dirname, "vite.config.mts") });
            tasks.output = `take it away ${chalk.yellow(
              "`electron-builder`"
            )}\n`;
          } catch (error) {
            errorLog(`failed to build renderer process\n`);
            return Promise.reject(error);
          }
        },
      },
    ],
    {
      concurrent: true,
      exitOnError: true,
    }
  );
  await tasksLister.run();
}

async function web() {
  await deleteAsync(["dist/web/*", "!.gitkeep"]);
  const { build } = await import("vite");
  build({ configFile: join(__dirname, "vite.config.mts") }).then((res) => {
    doneLog(`web build success`);
    process.exit();
  });
}
