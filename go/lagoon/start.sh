#!/bin/sh

# if [ $LAGOON_ENVIRONMENT_TYPE == "production" ]; then
# 	cd /app
# 	npm run start
# else
# 	cd /app
# 	npm run dev
# fi

cd /app
yarn build && yarn start
exit 0;