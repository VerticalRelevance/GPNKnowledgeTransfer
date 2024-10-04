provider "aws" {
  region = "us-east-1"
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "mock_api" {
  name           = "mock-api-1"
  api_key_source = "HEADER"
  endpoint_configuration {
    types = ["PRIVATE"]
  }
}

# Attach API Gateway Policy
resource "aws_api_gateway_rest_api_policy" "mock_api_policy" {
  rest_api_id = aws_api_gateway_rest_api.mock_api.id

  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Effect    = "Deny",
        Principal = "*",
        Action    = "execute-api:Invoke",
        Resource  = "arn:aws:execute-api:us-east-1:615299770864:${aws_api_gateway_rest_api.mock_api.id}/*",
        Condition = {
          StringNotEquals = {
            "aws:sourceVpce" = "vpce-0b3704b2e95cef13e"
          }
        }
      },
      {
        Effect    = "Allow",
        Principal = "*",
        Action    = "execute-api:Invoke",
        Resource  = "arn:aws:execute-api:us-east-1:615299770864:${aws_api_gateway_rest_api.mock_api.id}/*"
      }
    ]
  })
}

# Resource /graphql
resource "aws_api_gateway_resource" "graphql_resource" {
  rest_api_id = aws_api_gateway_rest_api.mock_api.id
  parent_id   = aws_api_gateway_rest_api.mock_api.root_resource_id
  path_part   = "graphql"
}

# POST method for /graphql
resource "aws_api_gateway_method" "graphql_post" {
  rest_api_id   = aws_api_gateway_rest_api.mock_api.id
  resource_id   = aws_api_gateway_resource.graphql_resource.id
  http_method   = "POST"
  authorization = "NONE"
  api_key_required = false

  request_parameters = {
    "method.request.header.x-api-key" = true
  }
}

# OPTIONS method for CORS handling
resource "aws_api_gateway_method" "graphql_options" {
  rest_api_id   = aws_api_gateway_rest_api.mock_api.id
  resource_id   = aws_api_gateway_resource.graphql_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Integration for POST method with AppSync
resource "aws_api_gateway_integration" "graphql_post_integration" {
  rest_api_id            = aws_api_gateway_rest_api.mock_api.id
  resource_id            = aws_api_gateway_resource.graphql_resource.id
  http_method            = aws_api_gateway_method.graphql_post.http_method
  type                   = "AWS"
  integration_http_method = "POST"
  uri                    = "arn:aws:apigateway:us-east-1:appsync-api:path/graphql"
  credentials            = "arn:aws:iam::615299770864:role/APIGatewayGraphProxyRole"

  request_parameters = {
    "integration.request.header.x-api-key" = "'da2-taltenepfrc7rdxxdufii5yhvy'"
  }

  passthrough_behavior = "WHEN_NO_TEMPLATES"
}

# Integration for OPTIONS method (CORS)
resource "aws_api_gateway_integration" "graphql_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.mock_api.id
  resource_id = aws_api_gateway_resource.graphql_resource.id
  http_method = aws_api_gateway_method.graphql_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# # Integration response for OPTIONS (CORS)
# resource "aws_api_gateway_integration_response" "graphql_options_integration_response" {
#   rest_api_id = aws_api_gateway_rest_api.mock_api.id
#   resource_id = aws_api_gateway_resource.graphql_resource.id
#   http_method = aws_api_gateway_method.graphql_options.http_method
#   status_code = "200"

#   response_parameters = {
#     "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token'"
#     "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST'"
#     "method.response.header.Access-Control-Allow-Origin"  = "'*'"
#   }

#   response_templates = {
#     "application/json" = ""
#   }
# }


# Stage for deployment
resource "aws_api_gateway_deployment" "mock_api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.mock_api.id
  stage_name  = "test"

  depends_on = [
    aws_api_gateway_method.graphql_post,
    aws_api_gateway_integration.graphql_post_integration
  ]
}

# Attach the POST method response
resource "aws_api_gateway_method_response" "graphql_post_response" {
  rest_api_id = aws_api_gateway_rest_api.mock_api.id
  resource_id = aws_api_gateway_resource.graphql_resource.id
  http_method = aws_api_gateway_method.graphql_post.http_method
  status_code = "200"
  response_models = {
    "application/json" = "Empty"
  }
}

# Attach the OPTIONS method response for CORS
resource "aws_api_gateway_method_response" "graphql_options_response" {
  rest_api_id = aws_api_gateway_rest_api.mock_api.id
  resource_id = aws_api_gateway_resource.graphql_resource.id
  http_method = aws_api_gateway_method.graphql_options.http_method
  status_code = "200"
}

# IAM role for API Gateway to interact with AppSync
resource "aws_iam_role" "api_gateway_role" {
  name = "APIGatewayGraphProxyRole"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "apigateway.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# Attach policy to IAM role
resource "aws_iam_role_policy_attachment" "appsync_access" {
  role       = aws_iam_role.api_gateway_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSAppSyncInvokeFullAccess"
}

# WebSocket API Configuration
resource "aws_apigatewayv2_api" "websocket_api" {
  name          = "AppSyncWebSocketAPI"
  protocol_type = "WEBSOCKET"
  route_key     = "$connect"
}

resource "aws_apigatewayv2_integration" "ws_integration" {
  api_id           = aws_apigatewayv2_api.websocket_api.id
  integration_type = "HTTP_PROXY"
  integration_uri  = "https://v557o3frxzge3lpvtoctdhvrgm.appsync-realtime-api.us-east-1.amazonaws.com/graphql"
  connection_type  = "INTERNET"
  integration_method = "POST" # Add the HTTP method
}

resource "aws_apigatewayv2_route" "ws_route" {
  api_id    = aws_apigatewayv2_api.websocket_api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.ws_integration.id}"
}
