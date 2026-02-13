#!/bin/bash

yarn install
yarn build

if [ -n "$VERSION" ]; then
   echo $VERSION > ./dist/version.txt
fi

zip -r dist.zip dist/
