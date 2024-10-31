# AWS CI/CD Pipeline for React App

This repository contains configurations and scripts to set up a CI/CD pipeline using AWS services like CodePipeline, CodeBuild, and S3 to build, test, and deploy a React application. The pipeline includes Dockerization of the application, with images stored in Amazon ECR.

---

## Prerequisites

To use the configurations and scripts in this repository, you will need the following:

- **AWS CLI**
- **Terraform** installed
- **AWS account** with necessary permissions to create CodePipeline, CodeBuild, S3 buckets, Amazon ECR repositories, and other required resources.

---

## Terraform Configuration

The `terraform/` folder contains the infrastructure as code to provision a CI/CD pipeline using AWS CodePipeline and CodeBuild.

### `sample.tf` Overview

The `sample.tf` file defines a **CodePipeline** and **CodeBuild** project that builds a React app. Below is a high-level overview of its structure:

- **S3 Bucket for Source**: This bucket is used to store the React app source code.
- **CodeBuild Project**: Defines the build environment, specifying the compute resources and the runtime environment for building the React app.
- **CodePipeline**: Automates the pipeline stages, from source retrieval to build execution and deployment.

### Steps to Deploy

1. **Configure Terraform**: Modify the variables in the `sample.tf` file as needed. Pay special attention to:
   - The S3 bucket where your source code will be stored.
   - The build environment and IAM roles required for CodeBuild and CodePipeline.
   
2. **Run Terraform**:
   ```bash
   terraform init
   terraform apply
   ```

   This will provision the infrastructure, including the S3 bucket, CodeBuild project, and CodePipeline.

3. **Push Source Code to S3**: Upload the React app's source code to the S3 bucket that was created. The pipeline will automatically trigger a build.

---

## Build Scripts

The repository includes several **build scripts** located in the `codebuild/` folder. These scripts are used by AWS CodeBuild to execute the build process for the React app and handle Dockerization.

### `buildspec.yml`

The `buildspec.yml` file defines the sequence of steps that CodeBuild will execute. This file is responsible for running the `scripts/build.sh` script to build a Docker image, installing dependencies, and deploying the built image to Amazon ECR.

#### Key Phases in `buildspec.yml`

1. **Install Dependencies**: 
   - Installs any required tools and dependencies, including Docker CLI, necessary for building and managing Docker containers.
   
2. **Pre-Build Phase**:
   - Authenticates to Amazon ECR using the AWS CLI to ensure CodeBuild can push Docker images to ECR.

3. **Build Phase**:
   - Executes the `scripts/build.sh` script, which builds a Docker container that includes all dependencies needed to run the React application. This includes:
     - Installing dependencies using `npm`.
     - Compiling the application for production using `npm run build`.
   - The Docker container is tagged with the repository URI and version, preparing it for upload to ECR.

4. **Post-Build Phase**:
   - Executes the `scripts/upload.sh` script, which pushes the Docker image to Amazon ECR, making it available for deployment in subsequent stages of the pipeline.

### `build.sh`

The `scripts/build.sh` script is a custom shell script responsible for:

1. **Building the Docker Image**: The script defines a Dockerfile (or uses an existing one) that installs all dependencies and builds the React app within a containerized environment. This ensures that the application is packaged with the required dependencies in a consistent environment.
   
2. **Tagging the Image**: After building the image, it is tagged using the ECR repository URI and the current Git commit hash (or another unique identifier) to ensure version control of images.

3. **Running Local Tests (Optional)**: If specified, the script can run tests on the application to verify its integrity before deployment.

The result is a Docker image that encapsulates the production-ready React application, along with all dependencies.

### `upload.sh`

The `scripts/upload.sh` script is responsible for uploading the Docker image created by `build.sh` to Amazon ECR. This script performs the following steps:

1. **Authenticate with ECR**: Ensures that the Docker CLI is authenticated with ECR to allow pushing images.

2. **Push the Docker Image**: Pushes the Docker image to the specified ECR repository. The image is now available for use in the deployment phase.

3. **Logging**: Provides logs for troubleshooting and to verify successful image upload.

---

## CI/CD Pipeline

Once the infrastructure is deployed and source code is uploaded to the S3 bucket, the CodePipeline will automatically start:

1. **Source Stage**: Retrieves the source code from the S3 bucket.
2. **Build Stage**: Executes the build process using AWS CodeBuild, running `buildspec.yml` to build and push the Docker image to ECR.
3. **Deploy Stage**: In a complete deployment setup, the Docker image could be pulled from ECR and deployed to ECS, EKS, or another service for hosting the React app.

The build logs for each phase can be viewed in the CodeBuild console, allowing for monitoring and debugging.

---

## `scripts/` Folder Overview

The `scripts/` folder contains helper scripts focused on automating the Dockerization process, handling image uploads, and managing dependencies.

### Scripts Overview

1. **`build.sh`**
   - Custom script that builds the Docker image for the React app, including all dependencies and production configurations.
   - Usage: Run automatically by CodeBuild as part of the build process, but can also be run locally for testing.

2. **`upload.sh`**
   - Script responsible for pushing the Docker image created by `build.sh` to Amazon ECR.
   - Usage: Also run by CodeBuild after building the Docker image, making the image available in ECR for deployment.

---

## Example Usage of Scripts

To build and push the Docker image locally (assuming AWS CLI is configured and Docker is installed):

```bash
# Build the Docker image
./scripts/build.sh

# Push the image to ECR
./scripts/upload.sh
```

---

## Troubleshooting

- **Build Errors**: Check CloudWatch Logs and CodeBuild logs for detailed error messages. Ensure Docker is correctly configured and authenticated with ECR.
- **Permission Issues**: Ensure the IAM role specified in CodeBuild has permissions for ECR, S3, and other services as required.