package main

import (
	"log"
	"strconv"

	"bi-backend/lib"
	"bi-backend/lambda-handlers"

	"gorm.io/gorm"

	"github.com/aws/aws-lambda-go/lambda"
)

var (
	db *gorm.DB
)

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

	err = lib.DeleteFormula(db, userId, uint(formulaId))

	return lambdahandlers.Status{Ok: true}, err
}

func main() {
	lambda.Start(lambdahandlers.WrapHandler(handleRequest))
}
