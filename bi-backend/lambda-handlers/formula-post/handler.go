package main

import (
	"log"
	"encoding/json"

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
	var formula lib.Formula
	json.Unmarshal([]byte(body), &formula)

	return lib.CreateFormula(db, userId, &formula)
}

func main() {
	lambda.Start(lambdahandlers.WrapHandler(handleRequest))
}
