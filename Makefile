# SED 2.0 — atajos de operación local.
#
#   make demo      → levanta el stack completo y deja la app en :3000
#   make migrate   → aplica el esquema Drizzle a la BD
#   make seed      → carga catálogos oficiales + datos demo
#   make logs      → tail de la app
#   make down      → apaga contenedores (datos persisten)
#   make clean     → apaga + borra volumen de Postgres (datos eliminados)
#   make test      → ejecuta vitest dentro de la imagen

.DEFAULT_GOAL := help
.PHONY: help demo build up migrate seed logs down clean test typecheck

help:
	@echo "SED 2.0 — comandos disponibles:"
	@echo "  make demo      Levanta Postgres + app y aplica esquema/seed"
	@echo "  make build     Construye la imagen Docker"
	@echo "  make up        Arranca contenedores en background"
	@echo "  make migrate   Aplica el esquema Drizzle"
	@echo "  make seed      Carga catálogos + datos demo"
	@echo "  make logs      Sigue logs de la app"
	@echo "  make down      Apaga contenedores"
	@echo "  make clean     Apaga + borra volumen de Postgres"
	@echo "  make test      Ejecuta vitest"

demo: build up migrate seed
	@echo ""
	@echo "✦ SED 2.0 listo en http://localhost:3000/es"
	@echo "  · Maya yucateca:       http://localhost:3000/yua"
	@echo "  · Health:              http://localhost:3000/api/health"
	@echo "  · OpenAPI 3.1:         http://localhost:3000/api/openapi.json"

build:
	docker compose build

up:
	docker compose up -d db app

migrate:
	docker compose run --rm migrate

seed:
	docker compose run --rm seed

logs:
	docker compose logs -f app

down:
	docker compose down

clean:
	docker compose down -v

test:
	docker compose run --rm app npm test

typecheck:
	docker compose run --rm app npm run typecheck
