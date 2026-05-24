package main

import (
	"context"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

func handler(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	code := req.PathParameters["code"]

	if code == "" {
		return events.APIGatewayV2HTTPResponse{StatusCode: 400, Body: `{"error":"missing code"}`}, nil
	}

	region := os.Getenv("AWS_REGION_NAME")
	if region == "" {
		region = "ap-south-1"
	}
	tableName := os.Getenv("TABLE_NAME")
	if tableName == "" {
		tableName = "url-shortener"
	}

	cfg, err := config.LoadDefaultConfig(ctx, config.WithRegion(region))
	if err != nil {
		return events.APIGatewayV2HTTPResponse{StatusCode: 500, Body: `{"error":"configuration error"}`}, nil
	}
	client := dynamodb.NewFromConfig(cfg)

	result, err := client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"short_code": &types.AttributeValueMemberS{Value: code},
		},
	})

	if err != nil || result.Item == nil {
		return events.APIGatewayV2HTTPResponse{StatusCode: 404, Body: `{"error":"not found"}`}, nil
	}

	longURL := result.Item["long_url"].(*types.AttributeValueMemberS).Value

	return events.APIGatewayV2HTTPResponse{
		StatusCode: 301,
		Headers: map[string]string{
			"Location":      longURL,
			"Cache-Control": "public, max-age=86400",
		},
	}, nil
}

func main() {
	lambda.Start(handler)
}
