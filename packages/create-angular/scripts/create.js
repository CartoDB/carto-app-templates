#!/usr/bin/env node
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProject } from '@carto/create-common';
import meow from 'meow';

const cli = meow(
  `
  Usage
    $ yarn create @carto/angular <target-directory>
  `,
  {
    importMeta: import.meta,
    autoHelp: true,
    autoVersion: true,
  },
);

const templateDir = resolve(fileURLToPath(import.meta.url), '../..');
const targetDir = cli.input.at(0) || '.';
await createProject(templateDir, targetDir);
