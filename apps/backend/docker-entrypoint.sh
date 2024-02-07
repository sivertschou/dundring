#!/bin/sh
set -e

cd libs/database

# Run database schema migration
yarn db:migrate

# Run database data migrations
node dist/migrate-data.cjs.js

exec "$@"
