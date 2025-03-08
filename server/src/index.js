const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send a message every 2 seconds
    const intervalId = setInterval(() => {
        res.write(`data: ${JSON.stringify({ message: "Hello, client!" })}\n\n`);
    }, 2000);

    req.on("close", () => {
        clearInterval(intervalId);
    });
});

app.listen(3000, () => console.log("SSE server running on port 3000"));
