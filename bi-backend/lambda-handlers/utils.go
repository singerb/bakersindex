package lambdahandlers

import (
	"context"
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
)

type Status struct {
	Ok bool `json:"ok"`
}

func WrapHandler(handler func(string, map[string]string, string) (any, error)) func(context.Context, *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2HTTPResponse, error) {
	return func(ctx context.Context, request *events.APIGatewayV2HTTPRequest) (*events.APIGatewayV2HTTPResponse, error) {
		claims := request.RequestContext.Authorizer.JWT.Claims
		userId, userIdExists := claims["sub"]
		if !userIdExists {
			return &events.APIGatewayV2HTTPResponse{
				StatusCode: 401,
				Body:       "Unauthorized or missing claims",
			}, nil
		}

		res, err := handler(userId, request.PathParameters, request.Body)

		if err != nil {
			return &events.APIGatewayV2HTTPResponse{
				StatusCode: 500,
				Body:       err.Error(),
			}, nil
		}
		ret, err := json.Marshal(res)

		return &events.APIGatewayV2HTTPResponse{
			StatusCode: 200,
			Headers:    map[string]string{"Content-Type": "text/json"},
			Body:       string(ret[:]),
		}, nil
	}
}
