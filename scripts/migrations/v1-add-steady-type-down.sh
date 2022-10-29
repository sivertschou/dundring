#!/bin/sh

echo "creating backup users.backup.down.json"
cp apps/backend/data/users.json apps/backend/data/users.backup.down.json

npm exec --yes --package=node-jq "jq 'del(.[].workouts[].parts[].type)' apps/backend/data/users.backup.down.json > apps/backend/data/users.json"

echo "Result:"
echo $(cat apps/backend/data/users.json)
echo "Done. Remember to check result and delete backup if OK :))"