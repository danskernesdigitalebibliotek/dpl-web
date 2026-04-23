#!/bin/bash

yarn install
yarn css:build
yarn build

if [ -n "$VERSION" ]; then
   echo $VERSION > ./build/version.txt
fi

zip -r dist.zip build/
