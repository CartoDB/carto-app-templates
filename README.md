# carto-app-templates

Templates for creating CARTO applications in React, Vue, and Angular.

## Quickstart

To create a new application, with CARTO, deck.gl, and your choice of web
frameworks:

```bash
# React
yarn create @carto/react path/to/my-project

# Vue
yarn create @carto/vue path/to/my-project

# Angular
yarn create @carto/angular path/to/my-project
```

At the prompts, provide a name for the project, and any other required
configuration details. A new CARTO application will be created in the
specified directory. To start development:

```bash
# open project directory
cd path/to/my-project

# install dependencies
yarn

# build and run local dev server
yarn dev

# build and run local dev server (OAuth)
yarn dev:ssl
```

## Docker

```bash
docker-compose build
docker-compose run --rm yarn
```

## Publish a new version

Before publishing a new modification you can increase the version as follows:

Remember, the version strategy can be one of the following:

- major (X.0.0)
- minor (0.X.0)
- patch (0.0.X)
- prerelease (0.0.0-X)

```bash
bash ./.github/ci-tools/yarn-increase-version.sh minor
```

Make a new tag with your new version:

```bash
git tag -d v0.0.13-0
git push origin :refs/tags/v0.0.13-0
```

## Versioning

Package versioning follows [Semantic Versioning 2.0.0](https://semver.org/).

## License

Provided as open source under [MIT License](./LICENSE.md).
