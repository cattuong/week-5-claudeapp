# File Upload Spec

## Feature Name
Contract File Upload

## Description
User uploads a PDF or DOCX contract file. The file is parsed to plain text and attached to the next message sent to Azure.

## User Flow
- User clicks attachment button in input bar
- File picker opens
- User selects a PDF or DOCX file
- File is parsed to plain text
- File name badge appears in input bar
- When user sends message the parsed text is included as contractText

## Libraries
- pdfjs-dist for PDF
- mammoth for DOCX

## Components
- FileUploadButton
- FilePreviewBadge

## Edge Cases
- Unsupported file type — show error
- File over 10MB — show warning
- Parse failure — show error and allow retry
- User removes file — clear contractText from state