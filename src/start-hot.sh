#!/bin/sh

[ ! -d "./node_modules/" ] && bun i
bun --watch memory.js
