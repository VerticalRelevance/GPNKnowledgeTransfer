# GPNKnowledgeTransfer
GPN LLM, Docker, and CodeBuild Reference

## Breakout
Modifying https://github.com/aws-samples/aws-genai-llm-chatbot to build react app and iac seperately


Here’s the updated **README** for the repository with descriptions of each script in the `scripts/` folder:

---

# GPN Knowledge Transfer

This repository contains examples and best practices for utilizing AWS CodeBuild and CodePipeline for automating the build and deployment of applications. Specifically, this project provides examples using **Terraform** to define the infrastructure for building and deploying a **React app**.

## Structure

The repository is organized into several key directories, including:

- `terraform/` - Contains Terraform configurations for setting up the required AWS infrastructure for CodePipeline and CodeBuild.
- `codebuild/` - Contains scripts and configurations used by AWS CodeBuild during the build and deployment process.
- `scripts/` - Contains helper scripts that assist with various tasks like code analysis, code quality checks, and managing the build process.

## Prerequisites

To use the configurations and scripts in this repository, you will need the following:

- AWS CLI
- Terraform installed
- AWS account with necessary permissions to create CodePipeline, CodeBuild, S3 buckets, and other required resources.

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

The repository includes several **build scripts** located in the `codebuild/` folder. These scripts are used by AWS CodeBuild to execute the build process for the React app.

### `buildspec.yml`

The `buildspec.yml` file defines the steps that CodeBuild will execute. This includes:

1. **Install Dependencies**: Installs the required npm packages for the React app.
2. **Build the App**: Runs the build command (`npm run build`) to create the production-ready version of the React app.
3. **Deploy**: Optionally, this step can deploy the built app to an S3 bucket or other hosting service.

### `build.sh`

The `build.sh` script provides a more customized build process for the React app. It can include additional steps such as linting, testing, or custom deployment logic.

### How to Use

These build scripts will be automatically executed by the AWS CodeBuild project that is provisioned by the Terraform code in the `sample.tf` file.

If you want to customize the build process, modify the `buildspec.yml` or `build.sh` files to suit your project needs.

---

## CI/CD Pipeline

Once the infrastructure is deployed and source code is uploaded to the S3 bucket, the CodePipeline will automatically start:

1. **Source Stage**: Retrieves the source code from the S3 bucket.
2. **Build Stage**: Executes the build process using AWS CodeBuild. The build logs can be viewed in the CodeBuild console.
3. **Deploy Stage**: Deploys the built React app (if specified) to an S3 bucket or other service.

---

## `scripts/` Folder Overview

The `scripts/` folder contains helper scripts that are primarily focused on automating checks, ensuring code quality, and managing the build process for the React app.

### Scripts Overview

1. **`build.sh`**
   - This is a custom build script that can be used to build the React app. It includes steps like installing dependencies, running tests, and compiling the app for production.
   - Usage: This script can be customized to include additional build steps like minifying assets or performing optimizations.

---nvm_install.sh
nvm_build.sh
upload.sh
    


### Future Enhancements

- Add automated testing as part of the build process.
- Set up notifications for pipeline success or failure using AWS SNS or other services.
- Implement blue-green or canary deployments for safer production releases.

--- 

This README provides a detailed overview of the Terraform configurations, build process, and helper scripts used in this project. Modify the build and deployment logic based on your specific requirements.