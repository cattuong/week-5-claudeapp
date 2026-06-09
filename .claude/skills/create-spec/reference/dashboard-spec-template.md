# Dashboard Spec

## Feature Name
Main Dashboard Layout

## Description
Three panel layout shown after login. Left sidebar for navigation, center for chat, right panel for execution steps.

## User Flow
- User logs in and lands on /dashboard
- Sidebar shows all previous chat sessions
- User clicks New Chat to start a new session
- User clicks a previous session to load it
- Right panel updates as actions are performed

## Layout
- Left Sidebar 260px: new chat button, session list, user profile
- Center Panel flex-1: chat interface, input bar, attachment button
- Right Panel 320px: execution steps, phase progress

## Components
- DashboardLayout
- Sidebar
- ChatArea
- RightPanel
- NewChatButton
- SessionListItem
- UserProfile

## Edge Cases
- No sessions yet — show empty state in sidebar
- Right panel empty on first load