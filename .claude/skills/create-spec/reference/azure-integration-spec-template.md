# Azure Integration Spec

## Feature Name
Azure AI Agent Integration

## Description
Sends the parsed contract text and user message to the Azure AI agent endpoint and returns the response to display in chat.

## User Flow
- User sends a message with or without a contract file
- /api/chat route receives contractText and userMessage
- Route calls Azure AI agent using DefaultAzureCredential
- Response text returned to frontend
- Displayed as assistant message in chat

## Auth
- DefaultAzureCredential from @azure/identity
- User runs az login before starting the app
- Values collected from user: endpoint, agent name, model deployment name
- Saved to .env.local

## API Routes
- POST /api/chat

## Request Body
- contractText: string
- userMessage: string

## Edge Cases
- Credential failure — show run az login message
- Empty response — show no response error
- Network error — show retry option