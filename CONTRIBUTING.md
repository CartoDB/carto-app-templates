# Contributing

_Contributions are subject to CARTO's [community contributions policy](https://carto.com/contributions/)._

## Local development requirements

- Yarn v4+
- Node.js v18+

## Quickstart

```bash
# install workspace dependencies
yarn

# build all templates
yarn build

# build and run local development servers for all templates
yarn dev
yarn dev:ssl # required for OAuth
```

After running `yarn dev`, all templates will begin running local development servers. Default configuration is found in a `.env` or `environment.ts` file in the template, with access to the default data sources. To test against other data sources, you may need to put another API key in the environment.

To run an individual template alone, run `yarn dev` in that template's subdirectory.

To test template instantiation locally, first run `yarn build`, and then run `node scripts/create.js path/to/target` from the template directory, and follow the prompts.

During local development, CSS styles are loaded from a shared `style.css` in the create-common module. When a template is instantiated, the dependency on create-common is removed and `style.css` is copied into the project for easier customization. All templates share a single global stylesheet.

## Linting

```bash
# run ESLint for all templates
yarn lint

# check Prettier formatting
yarn format --check

# apply Prettier formatting
yarn format --write
```

## Releases

All packages are published together. To create a standard release:

1. Update changelog and commit changes

2. Create a new version: `yarn lerna version [ major | minor | patch | prerelease ]`

3. Push to GitHub: `yarn postversion`

4. Publish
   - If working on `main`, the previous step will automatically create and push a branch. Open a pull request, get any required approvals, and merge. Merged pull requests with commit messages beginning `chore(release)` will trigger a release automatically.
   - If working on a branch, a commit for the release will be pushed to the branch. You'll then need to [manually run a workflow](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/manually-running-a-workflow), “Release”, selecting the target branch in the menu.
