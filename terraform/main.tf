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
  # Cognito User Pool authorization
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito_authorizer.id  # Cognito Authorizer
  
  api_key_required = true

  request_parameters = {
    "method.request.header.x-api-key" = true
  }
}

resource "aws_api_gateway_authorizer" "cognito_authorizer" {
  rest_api_id = aws_api_gateway_rest_api.mock_api.id
  name        = "CognitoUserPoolAuthorizer"
  type        = "COGNITO_USER_POOLS"

  # Point to your existing Cognito User Pool
  identity_source = "method.request.header.Authorization"
  provider_arns   = [aws_cognito_user_pool.user_pool.arn]
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
    "integration.request.header.x-api-key" = "'da2-taltenepfrc7rdxxdufii5yhvy'",
    "integration.request.header.Authorization"  = "method.request.header.Authorization"  # Pass Cognito token
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
  depends_on = [ aws_api_gateway_method.graphql_options ]
}

# Integration response for OPTIONS (CORS)
resource "aws_api_gateway_integration_response" "graphql_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.mock_api.id
  resource_id = aws_api_gateway_resource.graphql_resource.id
  http_method = aws_api_gateway_method.graphql_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  response_templates = {
    "application/json" = ""
  }
}

# Create a deployment resource
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
  response_models = {
    "application/json" = "Empty"
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin" = true
  }
  depends_on = [ aws_api_gateway_method.graphql_options ]
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

# Stage for deployment
resource "aws_api_gateway_stage" "mock_api_stage" {
  rest_api_id   = aws_api_gateway_rest_api.mock_api.id
  stage_name    = "test"
  deployment_id = aws_api_gateway_deployment.mock_api_deployment.id

  lifecycle {
    ignore_changes = [stage_name]  # This will prevent Terraform from creating the stage if it exists
  }
}

# Method settings for API Gateway stage
resource "aws_api_gateway_method_settings" "mock_api_stage_method_settings" {
  rest_api_id = aws_api_gateway_rest_api.mock_api.id
  stage_name  = aws_api_gateway_stage.mock_api_stage.stage_name

  method_path = "*/*"
  settings {
    metrics_enabled      = true
    logging_level        = "INFO"
    data_trace_enabled   = true
  }
}

# WEBSOCKET
# WebSocket API Configuration
resource "aws_apigatewayv2_api" "websocket_api" {
  name          = "AppSyncWebSocketAPI"
  protocol_type = "WEBSOCKET"
#   route_key     = "$connect"
  route_selection_expression = "$request.body.action"
}

# WebSocket API integration - Allows connection from within the VPC
resource "aws_apigatewayv2_integration" "ws_integration" {
  api_id             = aws_apigatewayv2_api.ws_api.id
  integration_type   = "HTTP_PROXY"
  integration_uri    = "https://v557o3frxzge3lpvtoctdhvrgm.appsync-realtime-api.us-east-1.amazonaws.com/graphql"
  connection_type    = "VPC_LINK"
  connection_id      = aws_apigatewayv2_vpc_link.my_vpc_link.id
  integration_method = "POST"

  # Pass Cognito Authorization token and API Key
  request_parameters = {
    "integration.request.header.Authorization" = "context.authorizer.claims['cognito:username']"
    "integration.request.header.x-api-key"     = "context.requestOverride.headers['x-api-key']"
  }
}

# VPC Link for API Gateway
resource "aws_apigatewayv2_vpc_link" "my_vpc_link" {
  name            = "vpc-link-for-websockets"
  subnet_ids      = ["subnet-12345678", "subnet-23456789"]  # Replace with your actual subnet IDs
  security_group_ids = [aws_security_group.websocket_sg.id]
}

# Security group allowing traffic from internal load balancer
resource "aws_security_group" "websocket_sg" {
  vpc_id = aws_vpc.example_vpc.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.example_vpc.cidr_block] # cidr block containing load balancer
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Define the VPC Interface Endpoint for AppSync (PrivateLink)
resource "aws_vpc_endpoint" "appsync_vpce" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.us-east-1.appsync-api"
  subnet_ids   = [aws_subnet.private.id]
  security_group_ids = [aws_security_group.default.id]
  private_dns_enabled = true
}

# WebSocket API Route
resource "aws_apigatewayv2_route" "ws_route" {
  api_id    = aws_apigatewayv2_api.websocket_api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.ws_integration.id}"
}

# Apply the Cognito Authorizer to the WebSocket API
resource "aws_apigatewayv2_route" "ws_route_with_authorizer" {
  api_id    = aws_apigatewayv2_api.websocket_api.id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.ws_integration.id}"
  authorizer_id = aws_apigatewayv2_authorizer.cognito_authorizer.id
}

# Cognito Authorizer for WebSocket API
resource "aws_apigatewayv2_authorizer" "cognito_authorizer" {
  api_id           = aws_apigatewayv2_api.websocket_api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.appsync_cognito_client.id]
    issuer   = "https://cognito-idp.us-east-1.amazonaws.com/${aws_cognito_user_pool.appsync_cognito_user_pool.id}"
  }

  name = "CognitoAuthorizer"
}

# WebSocket API Stage with CloudWatch Logs
resource "aws_apigatewayv2_stage" "ws_stage" {
  api_id      = aws_apigatewayv2_api.websocket_api.id
  name        = "production"
  deployment_id = aws_apigatewayv2_deployment.ws_deployment.id

  default_route_settings {
    logging_level = "INFO"
    data_trace_enabled = true
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.websocket_api_logs.arn
    format          = jsonencode({
      requestId       = "$context.requestId"
      ip              = "$context.identity.sourceIp"
      caller          = "$context.identity.caller"
      user            = "$context.identity.user"
      requestTime     = "$context.requestTime"
      httpMethod      = "$context.httpMethod"
      resourcePath    = "$context.resourcePath"
      status          = "$context.status"
      protocol        = "$context.protocol"
      responseLength  = "$context.responseLength"
    })
  }

  auto_deploy = true
}

# Deployment for the WebSocket API
# resource "aws_apigatewayv2_deployment" "ws_deployment" {
#   api_id = aws_apigatewayv2_api.websocket_api.id
#   depends_on = [aws_apigatewayv2_route.ws_route]
# }

#CLOUDWATCH
# Create a role for API Gateway to write logs to CloudWatch
resource "aws_iam_role" "apigateway_cloudwatch_role" {
  name = "APIGatewayCloudWatchLogsRole"

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

# Attach a policy to allow the role to write to CloudWatch
resource "aws_iam_role_policy" "apigateway_cloudwatch_policy" {
  role = aws_iam_role.apigateway_cloudwatch_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# CloudWatch log group for API Gateway logging
resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  name              = "/aws/apigateway/mock-api"
  retention_in_days = 14
}

# CloudWatch Log Group for WebSocket API
resource "aws_cloudwatch_log_group" "websocket_api_logs" {
  name              = "/aws/websocket/AppSyncWebSocketAPI"
  retention_in_days = 14
}

# IAM Role for API Gateway logging permissions
resource "aws_iam_role" "apigw_logging_role" {
  name = "APIGatewayLoggingRole"

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

# Attach CloudWatch log policy to the API Gateway role
resource "aws_iam_role_policy_attachment" "attach_logging_policy" {
  role       = aws_iam_role.apigw_logging_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

# Set the CloudWatch Logs Role in API Gateway Account Settings
resource "aws_api_gateway_account" "account" {
  cloudwatch_role_arn = aws_iam_role.apigw_logging_role.arn
}