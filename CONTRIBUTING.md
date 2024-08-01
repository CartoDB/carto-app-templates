# Contributing

_Contributions are subject to CARTO's [community contributions policy](https://carto.com/contributions/)._

## Local development requirements

- Yarn v4+
- Node.js v18+

## Quickstart

TODO

## Releases

All packages are published together. To create a standard release:

1. Update changelog

2. Create a new version:

- Release: `yarn lerna publish [ patch | minor | major ] --force-publish "*"`
- Prerelease: `yarn lerna publish prerelease --dist-tag alpha --force-publish "*"`
