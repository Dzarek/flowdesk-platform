# PROJECT.md

# FlowDesk

**AI Workspace for Hotel Reception Teams**

---

# Vision

FlowDesk is a modern SaaS application designed to support hotel reception teams in their daily work.

Instead of being another "Hotel Management System", FlowDesk focuses on improving the productivity of receptionists by combining operational tools with AI-powered assistance.

The long-term vision is to build a product that could realistically be offered to small and medium hotels.

---

# Personal Goal

This project is primarily built to:

- become a significantly stronger Frontend Engineer,
- learn modern Next.js architecture,
- gain practical full-stack experience,
- build a portfolio project that increases the chances of getting a Frontend Developer job.

The project should demonstrate not only programming skills but also product thinking, software architecture and engineering practices.

---

# Target Audience

- Boutique Hotels
- Apartments
- Guesthouses
- Small hotel chains

---

# Current Tech Stack

Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui

Backend

- Next.js Route Handlers
- Server Components
- Server Actions

Database

- PostgreSQL
- Supabase
- Prisma ORM

Authentication

- NextAuth (planned migration to Auth.js)

State

- Zustand
- TanStack Query

Utilities

- Axios
- bcryptjs

---

# Engineering Principles

This project follows several engineering principles.

## 1. Server First

Whenever possible:

- use React Server Components
- fetch data on the server
- minimize client-side JavaScript

Client Components should only be used for:

- forms
- interactions
- dialogs
- animations

---

## 2. Separation of Concerns

Application layers:

UI

↓

Hooks

↓

Services

↓

Repositories

↓

Database

---

## 3. Clean Code

Goals:

- no duplicated logic
- descriptive naming
- strongly typed code
- avoid "any"
- reusable components

---

## 4. Product Thinking

Every feature should solve a real problem.

No tutorial features.

No fake CRUD.

Everything should have business value.

---

# Current Progress

Infrastructure

✅ Next.js project

✅ TypeScript

✅ Tailwind

✅ shadcn/ui

✅ Prisma

✅ Supabase

✅ Authentication

✅ Login

✅ Dashboard Layout

✅ Server Components

✅ Repository Layer

✅ Service Layer

---

# Planned Features

## Sprint 1

Core Dashboard

- Dashboard layout
- Sidebar
- Navigation
- Widgets
- Responsive UI

---

## Sprint 2

Reservations

- Reservation list
- Filters
- Search
- Statuses
- Details

---

## Sprint 3

Guests

- Guest profiles
- Notes
- History
- Contact information

---

## Sprint 4

Rooms

- Room list
- Availability
- Cleaning status
- Maintenance

---

## Sprint 5

Reception Workspace

- Today's arrivals
- Today's departures
- Quick actions
- Notifications

---

## Sprint 6

AI Assistant

Examples:

- Summarize today's work.
- Find guests arriving after 20:00.
- Generate reply to guest email.
- Suggest room upgrade.
- Answer operational questions.

---

# Future Features

- Multi Hotel
- Team Management
- Notifications
- Analytics
- Audit Log
- Attachments
- Calendar
- PWA
- Offline Support

---

# Quality Standards

Every feature should include:

- clean architecture
- TypeScript
- loading state
- error state
- empty state
- responsive layout
- accessibility
- reusable components

---

# Git Strategy

Commits should be meaningful.

Examples:

feat: add reservation list

feat: implement authentication

refactor: split user service

fix: improve login validation

---

# Branch Strategy

Initially:

main

Later:

main

develop

feature/\*

---

# Development Workflow

Every new feature follows the same process.

1. Planning

2. Architecture

3. Implementation

4. Code Review

5. Refactoring

6. Documentation

7. Commit

---

# Role of ChatGPT

ChatGPT acts as:

- Senior Frontend Engineer
- Tech Lead
- Mentor
- Code Reviewer

ChatGPT should:

- explain architectural decisions,
- review code,
- encourage engineering best practices,
- avoid unnecessary shortcuts,
- prioritize understanding over copy-paste.

---

# Definition of Done

A feature is complete only if:

- it works,
- the code is clean,
- it is properly typed,
- reusable where appropriate,
- documented if needed,
- committed to Git.

---

# Long-Term Goal

Build a portfolio-quality SaaS application that demonstrates professional frontend engineering skills and helps secure a Frontend Developer position.
