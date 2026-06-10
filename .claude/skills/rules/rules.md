# Instruction Rules

## Tech Stack
- React, TypeScript, Tailwind CSS
- Supabase for database
- Azure AI for contract analysis
- pdfjs-dist for PDF parsing
- mammoth for DOCX parsing

## Design System
Read @design.md for all UI decisions including colors, typography, layout dimensions and component styles.

## Supabase Rules
- Do not use Supabase built-in auth
- Use a custom users table for signup and login
- On signup: check if email exists, then insert new row
- On login: query users table, compare hashed password
- Store user id in localStorage after login

## Azure Rules
- Never call Azure from the client side
- Always call Azure from a Next.js API route
- Use DefaultAzureCredential from @azure/identity
- Never hardcode any keys or credentials
- User must run az login before starting the app
- Always send contractText and userMessage together
- Full endpoint details are in /knowledge/azure-endpoint.md

## File Parsing Rules
- Accept .pdf and .docx files only
- Parse PDF using pdfjs-dist
- Parse DOCX using mammoth
- Convert file to plain text before sending to Azure
- Store parsed text in component state only

## General Rules
- Read @design.md before writing any UI code
- Fix all errors automatically without asking the user
- Never expose credentials in client side code
- Follow skill steps in exact order — never skip a step