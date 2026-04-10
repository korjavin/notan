# Notan

A minimal web app serving the ElevenLabs "Notan" conversational AI agent. Vanilla HTML/JS/CSS frontend with a Node.js/Express backend that proxies API credentials.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env and add your ElevenLabs API key
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `ELEVENLABS_API_KEY` | Yes | — | Your ElevenLabs API key |
| `ELEVENLABS_AGENT_ID` | No | `agent_9801kn6rrhd7fwe8hczpmm4ptzav` | ElevenLabs agent ID |
| `PORT` | No | `3000` | Server port |

## Running

```bash
node --env-file .env server.js
```

Open http://localhost:3000 in your browser.

## Docker

```bash
docker build -t notan .
docker run -p 3000:3000 --env-file .env notan
```

## Testing

```bash
npm test
```

## API Endpoints

- `GET /api/signed-url` — Returns a signed URL for the ElevenLabs convai widget
- `GET /api/conversation-token` — Returns a WebRTC conversation token
