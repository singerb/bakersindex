package main

import (
	"context"
	"encoding/json"
	"log"

	"bi-backend/lib"

	"gorm.io/gorm"

	"github.com/aws/aws-lambda-go/events"
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

func handleRequest(ctx context.Context, request *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2HTTPResponse, error) {
	claims := request.RequestContext.Authorizer.JWT.Claims
	userId, userIdExists := claims["sub"]
	if !userIdExists {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 401,
			Body:       "Unauthorized or missing claims",
		}, nil
	}

	formulas, err := lib.GetFormulas(db, userId)

	if err != nil {
		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Body:       "Error getting formulas",
		}, nil
	}
	ret, err := json.Marshal(formulas)

	return &events.APIGatewayV2HTTPResponse{
		StatusCode: 200,
		Headers:    map[string]string{"Content-Type": "text/json"},
		Body:       string(ret[:]),
	}, nil
}

func main() {
	lambda.Start(handleRequest)
}
