#!/bin/sh
jaq -i 'del(.[].workouts[].parts[].type)' apps/backend/data/users.json
