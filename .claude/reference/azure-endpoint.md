# Azure Endpoint

Before making any Azure calls, use the AskUserQuestion tool to collect
the following information from the user.

## Step 1 — Ask for Azure Details

Ask the user these questions one at a time:

Question 1:
"What is your Azure endpoint URL?"
Example: https://your-resource.services.ai.azure.com/api/projects/your-project

Question 2:
"What is your agent name?"
Example: my-legal-agent

Question 3:
"What is your model deployment name?"
Example: gpt-4o

Store the answers as:
- AZURE_ENDPOINT
- AZURE_AGENT_NAME
- AZURE_MODEL_DEPLOYMENT_NAME

---

## Step 2 — How to Call from Next.js API Route

Once you have the values from the user, use them in this code:

```typescript
import { DefaultAzureCredential } from "@azure/identity";
import { AIProjectClient } from "@azure/ai-projects";

const credential = new DefaultAzureCredential();

const client = new AIProjectClient(
  AZURE_ENDPOINT,
  credential
);

const agent = await client.agents.createVersion({
  agentName: AZURE_AGENT_NAME,
  definition: {
    model: AZURE_MODEL_DEPLOYMENT_NAME,
    instructions: "You are a legal contract review assistant.",
  },
});

const openaiClient = client.getOpenAIClient();

const response = await openaiClient.responses.create({
  input: [
    {
      role: "user",
      content: `Contract: ${contractText}\n\nQuestion: ${userMessage}`,
    },
  ],
  extra_body: {
    agent_reference: {
      name: agent.name,
      type: "agent_reference",
    },
  },
});

return response.output_text;
```

## Step 3 — Save to .env.local

After collecting the answers, write these to .env.local:
AZURE_ENDPOINT=value from user
AZURE_AGENT_NAME=value from user
AZURE_MODEL_DEPLOYMENT_NAME=value from user

## Step 4 — Install Dependencies

```bash
npm install @azure/identity @azure/ai-projects
```

## Authentication
No API key needed.
Use DefaultAzureCredential from @azure/identity.
User must run az login in terminal before starting the app.