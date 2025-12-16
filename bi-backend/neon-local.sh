#!/bin/sh

docker run -d --rm --name db -p 5432:5432 --env-file neon.env neondatabase/neon_local:latest
