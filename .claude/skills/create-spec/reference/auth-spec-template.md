# Auth Spec

## Feature Name
Signup and Login

## Description
User can create a new account or login to an existing account using a custom users table in Supabase. Do not use Supabase built-in auth.

## User Flow
- New user lands on /signup
- Enters email and password
- Account created in users table
- Redirected to /dashboard
- Returning user lands on /login
- Enters email and password
- Users table queried and password compared
- Redirected to /dashboard

## DB Schema
users (id, email, password_hash, created_at)

## API Routes
- POST /api/auth/signup
- POST /api/auth/login

## Components
- SignupPage
- LoginPage
- AuthForm
- AuthInput
- AuthButton

## Edge Cases
- Duplicate email on signup
- Wrong password on login
- Empty fields submitted
- User does not exist