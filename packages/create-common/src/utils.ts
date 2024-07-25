import { rm, stat, copyFile, mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

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
  return files.length === 0 || (files.length === 1 && files[0] === '.git');
}

export async function emptyDir(dir: string): Promise<void> {
  for (const file of await readdir(dir)) {
    if (file === '.git') {
      continue;
    }
    await rm(resolve(dir, file), { recursive: true, force: true });
  }
}

/******************************************************************************
 * NPM utilities.
 */

// Source: https://github.com/vitejs/vite/blob/main/packages/create-vite/src/index.ts
const VALIDATE_PKG_NAME_REGEX =
  /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/;

export function toValidPkgName(projectName: string) {
  if (VALIDATE_PKG_NAME_REGEX.test(projectName)) {
    return projectName;
  }

  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z\d\-~]+/g, '-');
}

export function removePkgDependencies<T extends Record<string, unknown>>(
  pkg: T,
  excludeDeps: string[],
): T {
  const dependencyTypes = [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
    'peerDependencies',
  ];

  for (const exclude of excludeDeps) {
    for (const type of dependencyTypes) {
      const dependencies = pkg[type] as Record<string, string> | undefined;
      if (dependencies && dependencies[exclude]) {
        delete dependencies[exclude];
      }
    }
  }

  return pkg;
}

export function removePkgFields<T extends Record<string, unknown>>(
  pkg: T,
  excludeFields: string[],
): T {
  for (const field of excludeFields) {
    delete pkg[field];
  }
  return pkg;
}