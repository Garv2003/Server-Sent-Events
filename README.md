# Server-Sent-Events

Real-time event streaming with **Server-Sent Events (SSE)** — a Go backend pushing live updates to browser clients over a single long-lived HTTP connection (no polling).

## What it shows
- An SSE endpoint streaming `text/event-stream`
- Go backend broadcasting events to all connected clients
- A minimal browser client that renders updates live

## Run locally
```bash
go run .
# then open the served page in your browser
```
