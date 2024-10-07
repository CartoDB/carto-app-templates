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

## Releases

All packages are published together. To create a standard release:

1. Update changelog

2. Create a new version:

- Release: `yarn lerna publish [ patch | minor | major ] --force-publish "*"`
- Prerelease: `yarn lerna publish prerelease --dist-tag alpha --force-publish "*"`
