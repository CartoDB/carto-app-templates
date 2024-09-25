FROM node:20.0

ENV DEBIAN_FRONTEND="noninteractive" \
    YARN_VERSION="4.2.2"

RUN apt-get update \
    && apt-get install -y curl
RUN curl -o yarn.js https://repo.yarnpkg.com/${YARN_VERSION}/packages/yarnpkg-cli/bin/yarn.js \
	&& chmod +x yarn.js \
	&& mv yarn.js /usr/local/bin/yarn \
	&& yarn --version

WORKDIR "/data"
ENTRYPOINT [ "yarn", "install" ]
