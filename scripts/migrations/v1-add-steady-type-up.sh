#!/bin/sh
jaq -i '.[].workouts[].parts[] += {type:"steady"}' apps/backend/data/users.json
