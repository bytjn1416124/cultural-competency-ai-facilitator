# Environment Configuration

This document describes the environment variables used in the Cultural Competency AI Facilitator application.

## Required Variables

### OpenAI API Configuration
- `NEXT_PUBLIC_OPENAI_API_KEY`: Your OpenAI API key for accessing the Realtime API

## Optional Variables

### Voice Configuration
- `NEXT_PUBLIC_DEFAULT_VOICE`: The default voice to use for the AI facilitator (default: 'alloy')

### WebSocket Configuration
- `NEXT_PUBLIC_WEBSOCKET_URL`: The WebSocket URL for the OpenAI Realtime API

### VAD Configuration
- `NEXT_PUBLIC_VAD_THRESHOLD`: Threshold for voice activity detection (0.0 to 1.0)
- `NEXT_PUBLIC_VAD_SILENCE_DURATION`: Duration of silence (in ms) before considering speech ended

### Session Configuration
- `NEXT_PUBLIC_MAX_SESSION_DURATION`: Maximum duration of a session in minutes
- `NEXT_PUBLIC_DEFAULT_BREAK_DURATION`: Default duration for breaks in minutes

### Debug Mode
- `NEXT_PUBLIC_DEBUG_MODE`: Enable debug logging when set to 'true'

## Setup Instructions

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your OpenAI API key:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
   ```

3. Adjust other variables as needed for your environment

## Security Notes

- Never commit `.env.local` to version control
- Keep your API keys secure and rotate them regularly
- All variables prefixed with `NEXT_PUBLIC_` will be exposed to the browser
