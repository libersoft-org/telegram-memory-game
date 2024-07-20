#!/bin/sh

[ ! -d "./node_modules/" ] && bun i
bun memory.js $1
