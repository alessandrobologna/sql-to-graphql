.PHONY: help

help:
	grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

CLUSTER ?= $(shell kubectl config view -o template --template='{{ index . "current-context" }}')
SERVICE ?= graphqlapp
NAMESPACE ?= test

TABLES ?= $(shell cat tables.txt)

__check:
ifndef DB_USER
	$(error DB_USER is undefined)
endif
ifndef DB_PASSWORD
	$(error DB_PASSWORD is undefined)
endif
ifndef DB_HOST
	$(error DB_HOST is undefined)
endif
ifndef DB
	$(error DB is undefined)
endif
ifndef SERVICE
	$(error SERVICE is undefined)
endif
ifndef NAMESPACE
	$(error SERVICE is undefined)
endif

generate: __check  ## Build scaffolded app.
	@NAMESPACE="$(NAMESPACE)" SERVICE="$(SERVICE)" TABLES="$(TABLES)" sh -c ' \
		node cli.js --database "$$DB" --host "$$DB_HOST" --output-dir "$$SERVICE-$$NAMESPACE" --user "$$DB_USER" --password "$$DB_PASSWORD" --relay --table $$TABLES && \
		envtpl < Makefile.template.mk > $$SERVICE-$$NAMESPACE/Makefile && \
	echo "-----------------------" &&\
	echo "Generation complete." &&\
	echo "Type:" &&\
	echo "  cd $$SERVICE-$$NAMESPACE" &&\
	echo "  make publish deploy" &&\
	echo "to deploy $$SERVICE to k8s"'

