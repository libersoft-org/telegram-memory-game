#!/bin/sh

./commit.sh $0
prettier --config prettier-koom.json --write "src/**/*.{js,ts,css,html}"
git status
