.PHONY: help

help:
	grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

VERSION ?= $(USER)-snapshot
REPO_NAME ?= {{NAMESPACE}}/{{SERVICE}}
REGION ?= us-east-1
NAMESPACE ?= {{NAMESPACE}}
SERVICE ?= {{SERVICE}}

{% raw %}
# use kubectl to determine the current cluster
CLUSTER ?= $(shell kubectl config view -o template --template='{{ index . "current-context" }}')
{% endraw %}

DOMAIN = $(NAMESPACE).$(CLUSTER)
# This assume that the cluster is in the form of cluster.example.com, and we can validate the domain on example.com
DOMAIN_VALIDATION ?= $(shell echo $(DOMAIN) | cut -d '.' -f 3- )
CERTIFICATE_ARN ?= \$(shell cert=$$(aws acm list-certificates --query 'CertificateSummaryList[?contains(DomainName, `$(DOMAIN)`)==`true`].CertificateArn' --output text); \
    [ -n "$$cert" ] && echo $$cert || aws acm request-certificate --domain-name '*.$(DOMAIN)' --domain-validation-options='DomainName=*.$(DOMAIN),ValidationDomain=$(DOMAIN_VALIDATION)'  --output text)

# create or get the ECR repo for $(REPO_NAME)
PUBLISH_TAG ?= $(shell aws ecr describe-repositories --repository-name $(REPO_NAME) \
    --query 'repositories[0].repositoryUri' --output text 2>/dev/null || aws ecr create-repository --repository-name $(REPO_NAME) \
    --query 'repository.repositoryUri' --output text ):$(VERSION)

DB_PASSWORD_BASE64 ?= $(shell printf $$DB_PASSWORD|base64)
DB_USER_BASE64 ?= $(shell printf $$DB_USER|base64)

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

publish: package
	@eval $$(aws ecr get-login --no-include-email --region $(REGION))
	@docker push $(PUBLISH_TAG)


package: ## Build service Docker image in contained builder.
	@docker build -t  $(PUBLISH_TAG) .

deploy:  ## deploy to the current kubectl context.
	@CLUSTER=$(CLUSTER) PUBLISH_TAG=$(PUBLISH_TAG) CERTIFICATE_ARN=$(CERTIFICATE_ARN) NAMESPACE=$(NAMESPACE) SERVICE=$(SERVICE) DB_USER_BASE64=$(DB_USER_BASE64) DB_PASSWORD_BASE64=$(DB_PASSWORD_BASE64) \
	sh -c '\
		envtpl < infra/ns.yaml | kubectl apply -f - && \
		envtpl < infra/secrets.yaml | kubectl apply -f - &&\
		envtpl < infra/dply.yaml | kubectl apply -f - &&\
		envtpl < infra/service.yaml | kubectl apply -f -\
		'
