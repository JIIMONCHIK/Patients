#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
    echo "Waiting for database..."
    # Извлекаем хост из DATABASE_URL
    DB_HOST=$(echo "$DATABASE_URL" | awk -F[@//] '{print $4}' | cut -d: -f1)
    DB_PORT=$(echo "$DATABASE_URL" | awk -F[@//] '{print $4}' | cut -d: -f2 | cut -d/ -f1)
    # Если порт не указан, используем 5432
    [ -z "$DB_PORT" ] && DB_PORT=5432

    until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "${POSTGRES_USER:-clinic_user}"; do
        echo "Postgres is unavailable - sleeping"
        sleep 2
    done
    echo "Postgres is up - executing command"
fi

exec "$@"