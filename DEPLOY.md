# Google AI Studio Application - Docker Deployment Guide

## 1. Project Overview
This project is a containerized web application that provides a "Positive Energy Master" chat interface. It supports both **Xiaomi MiMo API** (OpenAI-compatible) and **Google Gemini API**.

## 2. Prerequisites
- Docker installed (v20.10+ recommended)
- Docker Compose (v2.0+ recommended)

## 3. Quick Start

### Build and Run
Run the following command in the project root to build and start the container:

```bash
docker-compose up --build -d
```

The application will be accessible at: **http://localhost:3030**

### Stop the Application
```bash
docker-compose down
```

## 4. Configuration

### Environment Variables
The application uses the following environment variables. You can configure them in `docker-compose.yml` or `.env` file.

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `PORT` | The port the internal server listens on | `3030` |
| `MIMO_API_KEY` | Xiaomi MiMo API Key (Primary) | Must be provided for MiMo |
| `MIMO_BASE_URL` | Xiaomi MiMo API Base URL | `https://api.xiaomimimo.com/v1` |
| `API_KEY` | Google Gemini API Key (Fallback) | Optional |

### Configuration Guide
Create a `.env` file in the project root (based on `.env.example`):

**Option 1: Using Xiaomi MiMo (Recommended)**
```bash
mimo_api_key=your_mimo_key_here
MIMO_BASE_URL=https://api.xiaomimimo.com/v1
```

**Option 2: Using Google Gemini**
```bash
gemini_key=your_gemini_key_here
```

## 5. Architecture
- **Frontend**: React + Vite (Static files served by Backend)
- **Backend**: Node.js + Express
- **Model**: 
  - MiMo: `mimo-v2-flash`
  - Gemini: `gemini-2.5-flash`
- **Port**: Exposed on host port 3030 (mapped to container port 3030)

## 6. Verification
1. Open browser at `http://localhost:3030`.
2. Enter a message in the chat.
3. The server will prioritize `MIMO_API_KEY` if present.
