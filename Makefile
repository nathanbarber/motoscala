dev:
	./scripts/run.staging.sh

load-app:
	./scripts/load.sh
	./scripts/run.production.sh

push-app:
	./scripts/push.sh