.PHONY: help sign
.DEFAULT_GOAL := help

help: ## Show the current help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

sign: ## Sign and package the extension
	web-ext sign -s src --api-key="$(AMO_API_KEY)" --api-secret="$(AMO_API_SECRET)"
