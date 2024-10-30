# Overview
The **AWS GenAI Chatbot** is built using AWS Cloud services and provides users with an interface to interact with a range of large language models and retrieval mechanisms. It utilizes technologies like **Amazon Bedrock**, **SageMaker**, and **AWS API Gateway WebSocket APIs**, allowing for conversational history, document upload, and seamless user interaction.

## Getting Started

### Access the User Interface:
- The chatbot's interface is hosted on **Amazon S3**, behind **CloudFront**, and secured with **Amazon Cognito Authentication**.
- Ensure you have access credentials provided by the system administrator or through **Cognito user pools**.

### Login:
1. Click the **login icon** in the top right corner.
2. You will be redirected to the **Cognito authentication page**, where you can log in using your credentials.
3. Upon successful login, you’ll be redirected to the **chatbot home**.

## Login/Logout Process

- **Login**: Log in using credentials provided through the **Cognito authentication mechanism**. Once logged in, the home screen of the chatbot provides access to various chatbot models and RAG sources.
- **Logout**: To log out, click on the user icon and choose **"Logout"** from the dropdown menu.

## User Journey

### Accessing Chatbot Home
After logging in, the home page presents various tiles representing different services integrated into the chatbot application:

- **Amazon Bedrock**: Managed foundation models.
- **Amazon SageMaker**: Self-hosted models.
- **3rd Party Models**: Hugging Face, OpenAI, etc.
- **Full-fledged User Interface**: The UI built on **AWS Cloudscape design system**.
- **RAG Sources**: Various database integration options, like **Amazon Aurora**, **Amazon Kendra**, and **Amazon OpenSearch**.

### Choosing a Model
- Click on any of the tiles to explore model options.
- **Example**: Clicking on **Amazon Bedrock** opens a chat interface that connects to foundation models provided by Amazon.

### Interacting with the Chatbot

#### Ask Questions:
- Users can start a conversation by typing questions into the text input field.
- Depending on the selected model, the chatbot processes the input and returns a response.

#### Conversational History:
- The chatbot retains **conversational history**, allowing users to see past interactions and follow up with contextual queries.

#### Model Switching:
- Users can switch between different models during their interaction.
- Each model has unique capabilities, such as **natural language understanding** or **document retrieval** from RAG sources.

## Web Interface Features

- **Multiple LLM Integration**: Experiment with models like **OpenAI**, **Hugging Face**, **StabilityAI**, and others.
- **User Personalization**: Switch between **dark** and **light modes** for a personalized experience.
- **Real-time Updates**: Responses from the model are delivered in **real-time** through **WebSocket integration**.
- **Document Upload**: Users can upload documents for models to retrieve data or perform question-answering tasks.
