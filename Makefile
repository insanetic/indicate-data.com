# Build the production image and ship it to Docker Hub. Settings: deploy/config.mk
# Guide: deploy/README.md        Overview of targets: make help
# Rolling the image out on the server is done by Ansible, not from here.

-include deploy/config.mk
-include deploy/config.local.mk

# Image tag: short commit hash, plus -dirty when tracked files differ from the commit
# (tsconfig.tsbuildinfo is a build artefact that changes on every type check).
GIT_SHA := $(shell git rev-parse --short HEAD)
GIT_DIRTY := $(shell git status --porcelain --untracked-files=no -- . ':!tsconfig.tsbuildinfo' | head -n1)
TAG ?= $(GIT_SHA)$(if $(GIT_DIRTY),-dirty)

.DEFAULT_GOAL := help
.PHONY: help build push ship migration

help: ## Show this overview
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z_-]+:.*## / {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo
	@echo "  Current tag: $(TAG)    Image: $(or $(IMAGE),<IMAGE not set>)    Platform: $(PLATFORM)"

need-%:
	@test -n "$($*)" || { echo "$* is not set. Fill it in deploy/config.mk (or pass $*=... to make)."; exit 1; }

build: need-IMAGE ## Build the production image for PLATFORM (needs no database, no site config)
	docker buildx build \
		--platform $(PLATFORM) \
		--build-arg GIT_REVISION=$(TAG) \
		--tag $(IMAGE):$(TAG) \
		--tag $(IMAGE):latest \
		--load .
	@echo "Built $(IMAGE):$(TAG)"

push: need-IMAGE ## Push the current tag and :latest to Docker Hub
	docker push $(IMAGE):$(TAG)
	docker push $(IMAGE):latest
	@echo "Pushed $(IMAGE):$(TAG)  (deploy this tag with Ansible)"

ship: build push ## build + push

migration: need-NAME ## After a schema change: create src/migrations/<stamp>_NAME.ts (needs the dev database)
	NODE_ENV=production DATABASE_URL=$(or $(DEV_DATABASE_URL),postgres://payload:payload@localhost:5433/payload) \
		./node_modules/.bin/payload migrate:create $(NAME)
	@echo "Review the generated SQL, then commit src/migrations/."
