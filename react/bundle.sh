#!/bin/bash

npm install --legacy-peer-deps
npm run build

if [ -n "$VERSION" ]; then
   echo $VERSION > ./dist/version.txt
fi

zip -r dist.zip dist/
