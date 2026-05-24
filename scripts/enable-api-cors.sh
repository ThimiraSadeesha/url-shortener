#!/usr/bin/env bash
# Enable CORS on the existing HTTP API (required for browser calls from the Next.js UI).
set -euo pipefail

API_ID="${API_ID:-dsqeedu5n5}"
REGION="${AWS_REGION:-ap-south-1}"

aws apigatewayv2 update-api \
  --api-id "$API_ID" \
  --region "$REGION" \
  --cors-configuration '{
    "AllowOrigins": ["*"],
    "AllowMethods": ["GET", "POST", "OPTIONS"],
    "AllowHeaders": ["Content-Type"],
    "MaxAge": 86400
  }'

echo "CORS enabled on API $API_ID ($REGION)"
