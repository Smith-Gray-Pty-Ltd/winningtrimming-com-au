#!/bin/sh
# docker-entrypoint.sh — fix volume ownership then drop to nextjs user
#
# Volumes mounted from the old root container have root ownership.
# This script runs as root (the container starts as root), fixes the
# ownership of /app/public/media, then drops to the nextjs user via
# gosu before executing the CMD.
set -e

# Fix ownership of the media volume if it's owned by root
if [ -d /app/public/media ]; then
    chown -R nextjs:nextjs /app/public/media || true
fi

# Drop to nextjs and execute the CMD
exec gosu nextjs:nextjs "$@"