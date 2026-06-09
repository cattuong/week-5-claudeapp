We are building a production-style full-stack AI Contract Assistant using the existing React project setup, design system, coding standards, conventions, and best practices already available in this repository.

The React frontend has already been initialized and configured. Your task is to analyze the existing project structure and create a detailed implementation plan before writing any code.

Do not recreate the project setup. Do not write any production code until the planning phase is complete.

## Project Goal

Build a multi-user AI-powered contract assistant where users can upload a contract once, chat with an Azure AI Foundry Agent, and maintain multiple contract-specific conversations.

The application should feel similar to ChatGPT or Cowork with persistent chat sessions and a clean, modern UI.

## Core User Flow

1. A user signs up or logs in using Supabase Authentication.

2. The user lands on the dashboard.

3. The dashboard contains:

   * Left sidebar
   * Chat interface
   * Contract upload section

4. The user creates a new chat session.

5. The user uploads a contract.
   5.1 Parse the contract on the client side.
   5.2 Extract the document text.
   5.3 Do not send the original file to the backend.
   5.4 Store the extracted contract text for the active chat session.
   5.5 Process the contract only once per chat session.

6. The user sends a query.

7. The frontend sends:

   * extracted contract text
   * user query
   * conversation history (if required)

   to the backend.

8. The backend calls the Azure AI Foundry Agent Endpoint.

9. The AI response is returned and displayed in the chat.

10. The user can continue chatting without uploading the contract again.

11. The user can create multiple chat sessions.

12. Previous chat sessions remain visible in the sidebar.

13. Each chat session maintains:

* contract text
* conversation history
* AI context

14. Users should only have access to their own chats and contracts.

## Existing Project Requirements

* Use the existing React project.
* Reuse the existing design system.
* Follow the current folder structure.
* Create reusable components.
* Do not break existing UI conventions.
* Integrate new features into the current architecture.

## Technical Stack

* React
* TypeScript
* Tailwind CSS
* Supabase Authentication
* Supabase Database
* Azure AI Foundry Agent
* JSON-based conversation storage

## Important Rules

* Analyze the existing codebase first.
* Reuse existing components whenever possible.
* Parse contracts on the client side.
* Send extracted text instead of the original file.
* Upload and process the contract only once.
* Do not resend the contract with every query.
* Store conversation history.
* Support multiple chat sessions.
* Minimize Azure AI token usage.
* Keep the architecture modular and scalable.
* Complete the planning phase before implementation.

## Planning Deliverables

1. Review the existing project structure.

2. Identify where new features should be added.

3. Create the required folder structure.

4. Design the Supabase database schema.

5. Design the backend API flow.

6. Design the Azure AI integration flow.

7. Define the frontend component hierarchy.

8. Define the state management strategy.

9. Define the chat session architecture.

10. Create a phased implementation roadmap.

Do not start implementation until the complete architecture and development plan have been finalized.
