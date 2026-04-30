import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const appDir = resolve(rootDir, "app");
const distDir = resolve(rootDir, "dist");

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(appDir, distDir, {
  recursive: true,
  filter(source) {
    return !source.endsWith("README.md");
  }
});

console.log("Built static app to dist/");
