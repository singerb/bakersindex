.PHONY: all backend frontend deploy-staging
all: deploy-staging

backend:
	cd ../bi-backend/ && $(MAKE)

frontend:
	cd ../bi-frontend/ && . ${HOME}/.nvm/nvm.sh && nvm use && yarn run react-router build --mode staging

deploy-staging: backend frontend
	. ${HOME}/.nvm/nvm.sh && nvm use && pulumi up
