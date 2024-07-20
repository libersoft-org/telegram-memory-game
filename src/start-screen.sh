#!/bin/sh

[ ! -d "./node_modules/" ] && bun i
screen -dmS memory bash -c '
while true; do
 bun memory.js || exit 1
done
'
