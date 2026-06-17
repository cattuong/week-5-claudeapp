import OpenAI from 'openai'

export function getAzureClient(): OpenAI {
  const apiKey = process.env.AZURE_AGENT_ID
  const baseURL = process.env.AZURE_AGENT_ENDPOINT_URL

  if (!apiKey || !baseURL) {
    throw new Error('Missing Azure env vars: AZURE_AGENT_ID, AZURE_AGENT_ENDPOINT_URL')
  }

  return new OpenAI({
    baseURL,
    apiKey,
    defaultHeaders: { 'api-key': apiKey },
  })
}
