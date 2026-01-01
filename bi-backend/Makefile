.PHONY: all
all: lambda-handlers/formulas-get/bootstrap.zip lambda-handlers/formula-get/bootstrap.zip lambda-handlers/formula-delete/bootstrap.zip lambda-handlers/formula-put/bootstrap.zip lambda-handlers/formula-post/bootstrap.zip

lambda-handlers/%/bootstrap.zip: lambda-handlers/%/bootstrap
	zip -j $@ $<

lambda-handlers/%/bootstrap: lambda-handlers/%/handler.go
	GOOS=linux GOARCH=amd64 go build -tags lambda.norpc -o $@ $<
