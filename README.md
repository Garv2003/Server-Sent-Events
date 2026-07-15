# Server-Sent-Events

A minimal example of [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events):
a **Node.js / Express** backend that streams messages to the browser over a single
long-lived HTTP connection, and a plain HTML/JavaScript client that consumes the
stream with the browser `EventSource` API. The server pushes a JSON message every two
seconds; the client renders each message as it arrives and can close the connection on
demand.

## Features

- **SSE endpoint** (`GET /events`) that responds with the `text/event-stream`
  content type and the headers required to keep an SSE connection open
  (`Cache-Control: no-cache`, `Connection: keep-alive`).
- **Periodic push** — each connected request receives a `{ "message": "Hello, client!" }`
  payload every 2 seconds via `res.write(...\n\n)`.
- **Per-connection cleanup** — the interval is started per request and cleared when the
  client disconnects (`req.on("close", ...)`), so no timers leak.
- **CORS enabled** so the static client page can connect from a different origin.
- **Browser client** using `EventSource` that appends incoming messages to the page and
  provides a button to close the stream from the client side.

## How it works / Architecture

```
Browser client (client/index.html)
    │  new EventSource("http://localhost:3000/events")
    ▼
Express server (server/src/index.js) on port 3000
    │  GET /events
    │  set SSE headers
    │  setInterval every 2000ms ─► res.write("data: {...}\n\n")
    │  req "close" ─► clearInterval
    ▼
onmessage in the browser ─► JSON.parse(event.data) ─► append <p> to #messages
closeBtn click ─► eventSource.close()
```

1. The client creates an `EventSource` pointed at `http://localhost:3000/events`. The
   browser opens the connection and keeps it alive.
2. The server handles `GET /events`, sets the SSE response headers, and starts a
   `setInterval` that writes a `data:` frame every 2 seconds. Each write is one SSE
   message terminated by the required blank line (`\n\n`).
3. The client's `onmessage` handler fires for each frame, parses the JSON, and appends
   the message text to the `#messages` element. `onerror` logs failures.
4. Clicking **Close SSE Connection** calls `eventSource.close()` on the client. When the
   underlying request closes, the server's `close` listener clears the interval.

> Note on scope: this is a per-connection push demo, not a shared broadcast hub. Each
> `/events` request gets its own independent 2-second timer producing a fixed message;
> the server does not maintain a registry of clients or fan a single event out to all of
> them.

## Tech stack

**Server** (`server/package.json`, Node.js):

- **[Express](https://expressjs.com/)** `^4.21.2` — HTTP server and routing
- **[cors](https://github.com/expressjs/cors)** `^2.8.5` — cross-origin headers
- Node's built-in `setInterval` / response streaming for the SSE writes
- pnpm is used for dependency locking (`pnpm-lock.yaml`)

**Client** (`client/index.html`):

- No dependencies — a single static HTML file using the native `EventSource` API

## Getting started

**Server**

```bash
cd server
pnpm install        # or: npm install
pnpm dev            # runs `node src/index.js`
```

The server logs `SSE server running on port 3000`.

**Client**

Open `client/index.html` in a browser (double-click, or serve it with any static file
server). It connects to `http://localhost:3000/events`; make sure the server is running
first. Messages appear once per two seconds; click **Close SSE Connection** to stop.

## Usage

| Method | Path | Response | Behavior |
|---|---|---|---|
| `GET` | `/events` | `text/event-stream` | Emits `data: {"message":"Hello, client!"}` every 2s until the client disconnects |

Client-side controls (in `client/index.html`):

- Incoming messages are appended to `#messages`.
- The **Close SSE Connection** button calls `eventSource.close()` and appends a
  "Connection closed." note.

## Project structure

```
Server-Sent-Events/
├── client/
│   └── index.html           # Browser client: EventSource + close button
└── server/
    ├── src/
    │   └── index.js         # Express app, GET /events SSE endpoint (port 3000)
    ├── package.json         # express + cors; `dev` = node src/index.js
    └── pnpm-lock.yaml       # pnpm dependency lockfile
```
