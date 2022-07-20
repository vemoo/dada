#!/usr/bin/env bash
set -euo pipefail
shopt -s extglob

pushd "$(dirname "$0")"

./node_modules/.bin/tree-sitter parse ../dada_tests/**/*.dada

popd