#!/bin/sh
# docker-entrypoint.sh — fix volume/tmpfs ownership then drop to nextjs user
#
# Volumes and tmpfs mounts are owned by root by default. This script
# runs as root, fixes ownership, then drops to nextjs via gosu.
set -e

# Fix ownership of the media volume
if [ -d /app/public/media ]; then
    chown -R nextjs:nextjs /app/public/media || true
fi

# Fix ownership of the Next.js cache tmpfs
if [ -d /app/.next/cache ]; then
    chown -R nextjs:nextjs /app/.next/cache || true
fi

# Fix ownership of /tmp tmpfs
chown -R nextjs:nextjs /tmp || true

# Drop to nextjs and execute the CMD
exec gosu nextjs:nextjs "$@"