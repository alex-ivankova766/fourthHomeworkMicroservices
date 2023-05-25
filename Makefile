run:
	docker compose --profile dev up

build:
	docker compose --profile dev build

run-test:
	docker compose --profile test up postgres_test rabbitmq access datas main

build-test:
	docker compose --profile test build