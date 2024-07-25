import { rm, stat, copyFile, mkdir, readdir } from "node:fs/promises";
import { resolve } from "node:path";

/******************************************************************************
 * Disk utilities.
 *
 * References:
 * - https://github.com/vitejs/vite/blob/main/packages/create-vite/src/index.ts
 */

export async function copy(src: string, dest: string) {
  if ((await stat(src)).isDirectory()) {
    await copyDir(src, dest);
  } else {
    await copyFile(src, dest);
  }
}

export async function copyDir(srcDir: string, destDir: string): Promise<void> {
  await mkdir(destDir, { recursive: true });
  for (const file of await readdir(srcDir)) {
    const srcFile = resolve(srcDir, file);
    const destFile = resolve(destDir, file);
    await copy(srcFile, destFile);
  }
}

export async function isEmpty(path: string): Promise<boolean> {
  const files = await readdir(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

export async function emptyDir(dir: string): Promise<void> {
  for (const file of await readdir(dir)) {
    if (file === ".git") {
      continue;
    }
    await rm(resolve(dir, file), { recursive: true, force: true });
  }
}
