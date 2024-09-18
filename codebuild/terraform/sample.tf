# CODEBUILD EXAMPLE
#

data "aws_iam_policy_document" "codebuild" {
    statement {
      effect = "Allow"

      principals {
        type = "Service"
        identifiers = ["codebuild.amazonaws.com"]
      }

      actions = ["sts:AssumeRole"]
    }
}

data "aws_iam_policy_document" "codepipeline" {
    statement {
      effect = "Allow"

      principals {
        type = "Service"
        identifiers = ["codebuild.amazonaws.com"]
      }

      actions = ["sts:AssumeRole"]
    }
}

resource "aws_iam_role" "codebuild" {
  name = "ecr-codebuild-${var.deploy_uid}"
  path = "/"
  assume_role_policy = data.aws_iam_policy_document.codebuild.json
}

resource "aws_iam_role" "codepipeline" {
  name = "ecr-codepipeline-${var.deploy_uid}"
  path = "/"
  assume_role_policy = data.aws_iam_policy_document.codepipeline.json
}

resource "aws_iam_policy" "codebuild" {
  name = "ecr-codebuild-${var.deploy_uid}"
  policy = <<EOF
  {
  }
  EOF
}

resource "aws_iam_policy" "codepipeline" {
  name = "ecr-codepipeline-${var.deploy_uid}"
  policy = <<EOF
  {
  }
  EOF
}

resource "aws_iam_role_policy_attachment" "codebuild" {
  role = aws_iam_role.codebuild.name
  policy_arn = aws_iam_policy.codebuild.arn
}

resource "aws_iam_role_policy_attachment" "codepipeline" {
  role = aws_iam_role.codepipeline.name
  policy_arn = aws_iam_policy.codepipeline.arn
}

data "aws_iam_policy_document" "codepipeline" {
  statement {
    effect = "Allow"
    action = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "${aws_cloudwatch_log_group.default.arn}"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:PutObjectAcl",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
      "s3:GetBucketVersioning"
    ]
    resources = [
      "arn:aws:s3:::${var.s3_artifacts}"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "codebuild:BatchGetBuilds",
      "codebuild:StartBuild"
    ]
    resources = [
      "${aws_codebuild_project.default.arn}"
    ]
  }
}

resource "aws_codepipeline" "default" {
  name = var.pipeline_name

  role_arn = aws_iam_role.codepipeline.arn

  artifact_store {
    type = "S3"
    location = "${var.s3_artifact}"
  }

  stage {
    name = "GetArtifacts"

    action {
      name = "ArtifactStage"
      category = ""
      owner = "AWS"
      provider = "S3"
      version = "1"
      output_artifacts = [
        "LastCommit"
      ]
      configuration = {
        "PollForSourceChanges" = "true"
      }
    }
  }
  stage {
    name = "BuildStage"
    category = "Build"
    owner = "AWS"
    provider = "CodeBuild"
    version = "1"
    input_artifacts = [
      "LastCommit"
    ]
    configuration = {
      "ProjectName" = "ECRBuilder"
    }
  }
}

resource "aws_codebuild_project" "default" {
  name = "ecr-builder-${var.deploy_uid}"
  build_timeout = 2000
  service_role = aws_iam_role.codebuild.arn

  artifacts {
    type = "NO_ARTIFACTS"
  }

  environment {
    type = "LINUX_CONTAINER"
    compute_type = "BUILD_GENERAL1_MEDIUM" 
    image = "aws/codebuild/standard:7.0"

    environment_variables {
      name = "Sample"
      value = "Variable"
    }
  }

  source {
    type = "S3"
    location = "TODO"
    buildspec = "build/buildspec.yaml"
  }
}
