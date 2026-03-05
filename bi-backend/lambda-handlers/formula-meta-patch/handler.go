package main

import (
	"encoding/json"
	"log"
	"strconv"

	lambdahandlers "bi-backend/lambda-handlers"
	"bi-backend/lib"

	"github.com/aws/aws-lambda-go/lambda"
	"gorm.io/gorm"
)

var db *gorm.DB

func init() {
	maybeDb, err := lib.Connect()
	if err != nil {
		log.Fatalf("failed to connect database, %v", err)
	}
	db = maybeDb
}

func handleRequest(userId string, pathParameters map[string]string, body string) (any, error) {
	formulaId, err := strconv.ParseUint(pathParameters["formulaId"], 10, 0)
	if err != nil {
		return nil, err
	}

	var metas []lib.FormulaMeta
	if err := json.Unmarshal([]byte(body), &metas); err != nil {
		return nil, err
	}

	return lib.UpsertFormulaMetas(db, userId, uint(formulaId), metas)
}

func main() {
	lambda.Start(lambdahandlers.WrapHandler(handleRequest))
}
