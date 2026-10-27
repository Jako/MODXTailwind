#!/bin/sh
source /Users/jako/.zensical/bin/activate
cd docs/en || exit
zensical build
cd ../../
