#!/bin/sh
set -e

cd libs/database

# Run the database migration
yarn db:push

exec "$@"
