#!/bin/bash

VERSION_STRATEGY=$1

# Version Strategy:
# The version strategy can be one of the following:
# - major (X.0.0)
# - minor (0.X.0)
# - patch (0.0.X)
# - prerelease (0.0.0-X)
list_strategy="major minor patch prerelease"

function exists_in_list() {
    LIST=$1
    DELIMITER=$2
    VALUE=$3
    LIST_WHITESPACES=`echo $LIST | tr "$DELIMITER" " "`
    for x in $LIST_WHITESPACES; do
        if [ "$x" = "$VALUE" ]; then
            return 0
        fi
    done
    return 1
}

if [[ -z "$VERSION_STRATEGY" ]]; then
    echo "[ERROR] Must provide VERSION_STRATEGY variable"
    exit 1
fi

if ! exists_in_list "$list_strategy" " " ${VERSION_STRATEGY}; then
    echo "${VERSION_STRATEGY} is not in the list of valid options: [ ${list_strategy} ]"
    exit 1
fi

for d in $(ls packages);
do
    echo "Package: $d"
    cd packages/$d
    yarn version ${VERSION_STRATEGY}
    cd ../../
done

yarn install
