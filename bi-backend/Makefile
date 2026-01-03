.PHONY: build migrate-staging migrate-local
build: lambda-handlers/formulas-get/bootstrap.zip lambda-handlers/formula-get/bootstrap.zip lambda-handlers/formula-delete/bootstrap.zip lambda-handlers/formula-put/bootstrap.zip lambda-handlers/formula-post/bootstrap.zip

lambda-handlers/%/bootstrap.zip: lambda-handlers/%/bootstrap
	zip -j $@ $<

lambda-handlers/%/bootstrap: lambda-handlers/%/handler.go
	GOOS=linux GOARCH=amd64 go build -tags lambda.norpc -o $@ $<

migrate-staging:
	. .env.staging.local && atlas migrate apply --tx-mode all --revisions-schema public --url $$DATABASE_URL

migrate-local:
	. .env.local && atlas migrate apply --tx-mode all --revisions-schema public --url $$DATABASE_URL
