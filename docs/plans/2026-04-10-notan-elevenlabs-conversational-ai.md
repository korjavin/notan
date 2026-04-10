# Notan - ElevenLabs Conversational AI Web App

## Overview

A minimal web application serving the ElevenLabs "Notan" conversational AI agent. Vanilla HTML/JS/CSS frontend with a Node.js/Express backend that handles API key authentication. Dockerized for deployment.

## Context

- Files involved: all new (greenfield project)
- Agent ID: agent_9801kn6rrhd7fwe8hczpmm4ptzav
- Auth is required - backend must proxy credentials so the API key stays server-side
- Using the ElevenLabs convai widget (CDN) with signed URLs for the simplest vanilla JS integration
- Related patterns: none (empty repo)
- Dependencies: express, elevenlabs CDN widget

## Development Approach

- **Testing approach**: Regular (code first, then tests)
- Complete each task fully before moving to the next
- **CRITICAL: every task MUST include new/updated tests**
- **CRITICAL: all tests must pass before starting next task**

## Implementation Steps

### Task 1: Node.js backend with signed URL endpoint

**Files:**
- Create: `server.js`
- Create: `package.json`
- Create: `.env.example`

- [ ] Initialize package.json with express dependency
- [ ] Create Express server that serves static files from `public/`
- [ ] Add `GET /api/signed-url` endpoint that fetches a signed URL from ElevenLabs API using the server-side API key
- [ ] Add `GET /api/conversation-token` endpoint for WebRTC token generation
- [ ] Add basic error handling for missing API key and failed upstream requests
- [ ] Write tests for the API endpoints (mock the ElevenLabs API calls)
- [ ] Run project test suite - must pass before task 2

### Task 2: Frontend - HTML/JS/CSS with convai widget

**Files:**
- Create: `public/index.html`
- Create: `public/style.css`
- Create: `public/app.js`

- [ ] Create index.html with the ElevenLabs convai widget script (CDN) and a clean minimal layout
- [ ] Write app.js that fetches a signed URL from `/api/signed-url` and passes it to the widget element
- [ ] Add basic CSS styling for a centered, clean conversation interface
- [ ] Add connection status indicator and error display
- [ ] Write tests for the frontend JS (signed URL fetch logic)
- [ ] Run project test suite - must pass before task 3

### Task 3: Dockerize the application

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`
- Create: `.gitignore`

- [ ] Create a multi-stage Dockerfile: node:alpine, install deps, copy source, expose port
- [ ] Create .dockerignore (node_modules, .env, .git)
- [ ] Create .gitignore (node_modules, .env)
- [ ] Test Docker build and run locally
- [ ] Run project test suite - must pass before task 4

### Task 4: Verify acceptance criteria

- [ ] Run full test suite
- [ ] Verify the app starts and serves the frontend
- [ ] Verify signed URL endpoint returns a valid response (with valid API key)
- [ ] Verify Docker container builds and runs correctly

### Task 5: Update documentation

- [ ] Create README.md with setup instructions, env vars, and Docker usage
- [ ] Move this plan to `docs/plans/completed/`
