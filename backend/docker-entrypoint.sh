#!/bin/sh
set -e

echo "Warte auf Postgres..."
until npx prisma db push --skip-generate --accept-data-loss; do
  sleep 2
done

echo "DB-Schema synchronisiert, starte Server..."
exec npm run dev
