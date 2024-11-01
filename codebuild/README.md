# AWS CI/CD Pipeline with Multiple CodeBuild Projects

This repository contains configurations for setting up a CI/CD pipeline using AWS CodePipeline and CodeBuild. 
The infrastructure is defined using Terraform to automate the deployment and building of various components within the application.

## Prerequisites

To use the configurations and scripts in this repository, you will need the following:

- AWS CLI
- Terraform installed
- AWS account with necessary permissions to create CodePipeline, CodeBuild, S3 buckets, and other required resources.

---

## Overview

The CI/CD setup includes four different **AWS CodePipeline** pipelines, each linked to a dedicated **CodeBuild** project. 
Each pipeline watches the same S3 bucket (`codebuild`) for changes and, upon detecting any modifications, initiates its respective CodeBuild process. 
The pipelines and CodeBuild projects include:

1. **Outgoing Messages** - Lambda Layer in TypeScript
2. **Common Layer** - Lambda Layer with Python dependencies
3. **File Upload Container** - Dockerized process for handling file uploads
4. **React App** - Builds and deploys the React application

## CodePipeline & CodeBuild Projects

### 1. Outgoing Messages (Lambda Layer in TypeScript)

- **Pipeline**: Watches the `codebuild` S3 bucket for changes related to the outgoing messages layer.
- **CodeBuild Project**: This CodeBuild project is responsible for building a Lambda layer specifically written in TypeScript. 
- **Key Steps**:
  - **TypeScript Compilation**: Compiles the TypeScript files and packages them into a format compatible with AWS Lambda.
  - **Deployment**: Uploads the resulting package to S3, making it available as a Lambda layer for other functions in the application.

### 2. Common Layer (Lambda Layer with Python Dependencies)

- **Pipeline**: Watches the `codebuild` S3 bucket for changes related to the common dependencies used across all Python-based Lambda functions in the application.
- **CodeBuild Project**: This project builds a Lambda layer that includes shared Python dependencies.
- **Key Steps**:
  - **Dependency Installation**: Installs Python dependencies that are required across multiple Lambda functions.
  - **Layer Packaging**: Packages the dependencies into a Lambda layer that can be attached to any Python Lambda function within the application.
  - **Deployment**: The packaged Lambda layer is deployed to S3, allowing it to be reused in different Lambda functions.

### 3. File Upload Container (Dockerized Process)

- **Pipeline**: Monitors the `codebuild` S3 bucket for any updates related to the file upload container.
- **CodeBuild Project**: This project builds a Docker image for handling file uploads.
- **Key Steps**:
  - **Docker Build**: Calls the `scripts/build.sh` script to build the Docker container defined in the Dockerfile.
  - **ECR Upload**: Uses `scripts/upload.sh` to push the Docker container image to Amazon Elastic Container Registry (ECR).
  - **Container Management**: Once uploaded, the container can be utilized by other services within the application for handling file uploads in a scalable manner.

### 4. React App (Web Application)

- **Pipeline**: Watches the `codebuild` S3 bucket for changes related to the React app source code.
- **CodeBuild Project**: This project handles the build and deployment process of the React application.
- **Key Steps**:
  - **Environment Setup**: Runs `nvm install` to set up the necessary Node.js environment.
  - **Application Build**: Runs `npm build` to generate a production-ready build of the React application.
  - **Deployment**: Uses `upload.sh` to deploy the built app to an S3 bucket configured for web hosting.

---

## Terraform Configuration

The `terraform/` folder contains infrastructure code to deploy the CodePipeline pipelines and CodeBuild projects.

### `sample.tf` Overview

The `sample.tf` file includes definitions for the following:

- **S3 Bucket for Source**: The bucket where source code and configuration files are uploaded. All pipelines monitor this bucket for changes.
- **CodeBuild Projects**: Configurations for each CodeBuild project (Outgoing Messages, Common Layer, File Upload Container, React App), specifying build environments, compute resources, and runtime settings.
- **CodePipeline Pipelines**: Each CodePipeline is associated with a specific CodeBuild project and will initiate the build process when changes in the `codebuild` S3 bucket are detected.

### Steps to Deploy

1. **Configure Terraform**: Modify the variables in the `sample.tf` file as needed. Ensure that the S3 bucket, build environments, and IAM roles required for each CodeBuild project are correctly specified.
   
2. **Run Terraform**:
   ```bash
   terraform init
   terraform apply
   ```

   This will create the S3 bucket, CodeBuild projects, and CodePipeline pipelines for the four components.

3. **Push Source Code to S3**: Upload the source code for each component to the `codebuild` S3 bucket. Each pipeline will automatically trigger the relevant build process.

---

## Build Scripts

The repository includes build scripts located in the `codebuild/` folder, utilized by the different CodeBuild projects to execute the build and deployment processes.

### `buildspec.yml`

The `buildspec.yml` file contains the build instructions for each CodeBuild project. Key phases in the file include:

1. **Install Dependencies**: Installs necessary libraries and dependencies based on the component being built.
2. **Build Steps**:
   - **For React App**: Runs `npm build` to compile the application.
   - **For File Upload Container**: Calls `scripts/build.sh` to build the Docker container and `scripts/upload.sh` to push it to ECR.
3. **Deployment**: Specifies deployment steps where applicable, such as uploading the React app to an S3 bucket or deploying Lambda layers to S3.

### `build.sh` (Docker Build Script)

This script builds a Docker container, typically for the File Upload Container project, and includes the following steps:

1. **Install Dependencies**: Installs all dependencies specified in the Dockerfile.
2. **Build Container**: Creates the Docker image.
3. **Push to ECR**: Uses `scripts/upload.sh` to upload the image to Amazon ECR.

### `upload.sh` (ECR Upload Script)

This script is used by the **File Upload Container** project to push the Docker image to Amazon ECR. It handles authentication with ECR and ensures that the Docker image is uploaded successfully, making it available for deployment.

---

## CI/CD Pipeline

After deployment and source code upload, the CodePipeline pipelines will automatically start the build and deployment process for each component:

1. **Source Stage**: Retrieves the source code from the `codebuild` S3 bucket.
2. **Build Stage**: Executes the build process using AWS CodeBuild.
3. **Deploy Stage**: Deploys the built components to their respective destinations (e.g., Lambda layers, S3, or ECR).

---

## `scripts/` Folder Overview

The `scripts/` folder contains helper scripts that automate aspects of the build process, particularly for Docker and ECR uploads.

### Scripts Overview

1. **`build.sh`**
   - This script is used to build a Docker container, which is primarily used by the **File Upload Container** project.
   - Usage: Customizable for including additional steps in the Docker build process, such as optimizations.

2. **`upload.sh`**
   - This script authenticates with ECR and uploads Docker images built by `build.sh`.
   - Ensures that Docker images are pushed to ECR and available for deployment.

---