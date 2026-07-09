#!/bin/sh
set -e

echo "Esperando a que MySQL este disponible..."

MAX_RETRIES=30
RETRY_INTERVAL=2
retries=0

until echo "SELECT 1;" | npx prisma db execute --stdin > /dev/null 2>&1; do
  retries=$((retries + 1))
  if [ "$retries" -ge "$MAX_RETRIES" ]; then
    echo "ERROR: MySQL no respondio despues de $((MAX_RETRIES * RETRY_INTERVAL)) segundos. Abortando."
    exit 1
  fi
  echo "  MySQL no disponible aun -- reintento $retries/$MAX_RETRIES en ${RETRY_INTERVAL}s..."
  sleep "$RETRY_INTERVAL"
done

echo "MySQL disponible."

echo "Sincronizando esquema de base de datos con Prisma..."
npx prisma db push --skip-generate --accept-data-loss
echo "Esquema sincronizado."

echo "Ejecutando seed..."
npx prisma db seed || echo "Seed omitido o ya ejecutado."

echo "Iniciando el backend..."
exec "$@"
