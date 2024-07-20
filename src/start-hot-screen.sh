#!/bin/sh

[ ! -d "./node_modules/" ] && bun i
screen -dmS memory bun --watch memory.js
