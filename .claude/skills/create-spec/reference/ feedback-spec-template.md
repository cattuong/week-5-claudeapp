# Feedback Spec

## Feature Name
Chat Feedback Form

## Description
After every assistant response a feedback form appears below the message. User submits a star rating and optional comment which is saved to Supabase.

## User Flow
- Assistant message appears in chat
- Feedback form shown below the message
- User selects a rating from 1 to 5
- User optionally adds a comment
- User submits the form
- Row saved to feedback table
- Form collapses and thank you message shown

## DB Schema
feedback (id, user_id, session_id, rating, comment, created_at)

## API Routes
- POST /api/feedback

## Components
- FeedbackForm
- StarRating
- FeedbackThankYou

## Edge Cases
- User dismisses form without submitting
- Prevent duplicate submission for same message