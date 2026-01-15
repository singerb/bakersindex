.PHONY: all backend frontend-staging frontend-production deploy-staging deploy-production
all: deploy-staging

backend:
	cd ../bi-backend/ && $(MAKE)

frontend-staging:
	cd ../bi-frontend/ && . ${HOME}/.nvm/nvm.sh && nvm use && yarn run react-router build --mode staging

frontend-production:
	NODE_ENV=production cd ../bi-frontend/ && . ${HOME}/.nvm/nvm.sh && nvm use && yarn run react-router build --mode production

deploy-staging: backend frontend-staging
	. ${HOME}/.nvm/nvm.sh && nvm use && pulumi stack select staging && pulumi up

deploy-production: backend frontend-production
	. ${HOME}/.nvm/nvm.sh && nvm use && pulumi stack select production && pulumi up
