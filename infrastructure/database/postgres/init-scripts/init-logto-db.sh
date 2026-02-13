#!/bin/sh
set -eu

: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${LOGTO_DB_USER:?LOGTO_DB_USER is required}"
: "${LOGTO_DB_PASSWORD:?LOGTO_DB_PASSWORD is required}"
: "${LOGTO_DB_NAME:?LOGTO_DB_NAME is required}"

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set=logto_db_user="$LOGTO_DB_USER" \
  --set=logto_db_password="$LOGTO_DB_PASSWORD" \
  --set=logto_db_name="$LOGTO_DB_NAME" \
  --set=postgres_user="$POSTGRES_USER" <<'SQL'
SELECT format(
  'CREATE ROLE %I LOGIN PASSWORD %L',
  :'logto_db_user',
  :'logto_db_password'
)
WHERE NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = :'logto_db_user')\gexec

SELECT format(
  'ALTER ROLE %I WITH LOGIN PASSWORD %L',
  :'logto_db_user',
  :'logto_db_password'
)
WHERE EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = :'logto_db_user')
  AND :'logto_db_user' <> :'postgres_user'\gexec

SELECT format('CREATE DATABASE %I', :'logto_db_name')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'logto_db_name')\gexec

SELECT format('ALTER DATABASE %I OWNER TO %I', :'logto_db_name', :'logto_db_user')\gexec
SELECT format('GRANT ALL PRIVILEGES ON DATABASE %I TO %I', :'logto_db_name', :'logto_db_user')\gexec
SQL
