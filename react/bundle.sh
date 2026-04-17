#!/bin/bash

pnpm install
pnpm run build

if [ -n "$VERSION" ]; then
   echo $VERSION > ./dist/version.txt
fi

zip -r dist.zip dist/
