package main

import (
	"context"
	"encoding/json"
	"math/rand"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

type Request struct {
	LongURL string `json:"long_url"`
}

type Response struct {
	ShortCode string `json:"short_code"`
	ShortURL  string `json:"short_url"`
}

type Item struct {
	ShortCode string `dynamodbav:"short_code"`
	LongURL   string `dynamodbav:"long_url"`
	CreatedAt string `dynamodbav:"created_at"`
	TTL       int64  `dynamodbav:"ttl"`
}

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

func randomCode(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func corsHeaders() map[string]string {
	return map[string]string{
		"Content-Type":                 "application/json",
		"Access-Control-Allow-Origin":  "*",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Max-Age":       "86400",
	}
}

func shortURLBase(req events.APIGatewayV2HTTPRequest) string {
	if base := strings.TrimSuffix(os.Getenv("SHORT_URL_BASE"), "/"); base != "" {
		return base
	}
	if req.RequestContext.DomainName != "" {
		return "https://" + req.RequestContext.DomainName
	}
	return ""
}

func handler(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	if req.RequestContext.HTTP.Method == "OPTIONS" {
		return events.APIGatewayV2HTTPResponse{
			StatusCode: 204,
			Headers:    corsHeaders(),
		}, nil
	}

	var body Request
	if err := json.Unmarshal([]byte(req.Body), &body); err != nil || body.LongURL == "" {
		return events.APIGatewayV2HTTPResponse{
			StatusCode: 400,
			Headers:    corsHeaders(),
			Body:       `{"error":"long_url required"}`,
		}, nil
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
		return events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Headers:    corsHeaders(),
			Body:       `{"error":"configuration error"}`,
		}, nil
	}
	client := dynamodb.NewFromConfig(cfg)

	code := randomCode(6)
	ttl := time.Now().Add(30 * 24 * time.Hour).Unix()

	item, err := attributevalue.MarshalMap(Item{
		ShortCode: code,
		LongURL:   body.LongURL,
		CreatedAt: time.Now().UTC().Format(time.RFC3339),
		TTL:       ttl,
	})
	if err != nil {
		return events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Headers:    corsHeaders(),
			Body:       `{"error":"internal error"}`,
		}, nil
	}

	_, err = client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(tableName),
		Item:      item,
	})
	if err != nil {
		return events.APIGatewayV2HTTPResponse{
			StatusCode: 500,
			Headers:    corsHeaders(),
			Body:       `{"error":"failed to save"}`,
		}, nil
	}

	base := shortURLBase(req)
	shortURL := base + "/" + code
	resp, _ := json.Marshal(Response{
		ShortCode: code,
		ShortURL:  shortURL,
	})

	return events.APIGatewayV2HTTPResponse{
		StatusCode: 201,
		Headers:    corsHeaders(),
		Body:       string(resp),
	}, nil
}

func main() {
	lambda.Start(handler)
}
