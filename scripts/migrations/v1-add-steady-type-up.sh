#!/bin/sh

echo "creating backup users.backup.up.json"
cp apps/backend/data/users.json apps/backend/data/users.backup.up.json

./node_modules/node-jq/bin/jq '.[].workouts[].parts[] += {type:"steady"}' apps/backend/data/users.backup.up.json  > apps/backend/data/users.json

echo "Result:"
echo $(cat apps/backend/data/users.json)
echo "Done. Remember to check result and delete backup if OK :)). "
