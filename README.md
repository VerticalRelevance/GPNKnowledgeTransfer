# GPNKnowledgeTransfer
GPN LLM, Docker, and CodeBuild Reference

## Breakout
Modifying https://github.com/aws-samples/aws-genai-llm-chatbot to build react app and iac seperately

---

# GPN Knowledge Transfer

This repository contains examples and best practices for utilizing AWS CodeBuild and CodePipeline for automating the build and deployment of applications. Specifically, this project provides examples using **Terraform** to define the infrastructure for building and deploying a **React app**.

## Structure

The repository is organized into several key directories, including:

- `breakout/` - The deployment of the backend and the frontend portions of the application are broken out here to cater to the specific deployment conditions of GPN.
   - `iac/` - This folder contains the code responsible for deploying the backend infrastructure of the application.
   - `react/` - This folder contains the code responsible for deploying the React frontend.
- `codebuild/` - Contains scripts and configurations used by AWS CodeBuild during the build and deployment process. Also contains Terraform configurations for setting up the required AWS infrastructure for CodePipeline and CodeBuild.

Contains helper scripts that assist with various tasks like code analysis, code quality checks, and managing the build process.


# TODO
- AWS Resources Deployed
- Using AppSync
- Private Chatbot
- Document stores
