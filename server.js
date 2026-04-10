const express = require("express");
const path = require("path");

const app = express();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_AGENT_ID =
  process.env.ELEVENLABS_AGENT_ID || "agent_9801kn6rrhd7fwe8hczpmm4ptzav";
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/signed-url", async (req, res) => {
  if (!ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: "ELEVENLABS_API_KEY is not configured" });
  }

  try {
    const url = `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${encodeURIComponent(ELEVENLABS_AGENT_ID)}`;
    const response = await fetch(url,
      {
        method: "GET",
        headers: { "xi-api-key": ELEVENLABS_API_KEY },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error(`ElevenLabs signed-url API error (${response.status}): ${text}`);
      return res
        .status(502)
        .json({ error: "ElevenLabs API request failed" });
    }

    const data = await response.json();
    res.set("Cache-Control", "no-store");
    res.json(data);
  } catch (err) {
    console.error("Failed to reach ElevenLabs API (signed-url):", err.message);
    res.status(502).json({ error: "Failed to reach ElevenLabs API" });
  }
});

app.get("/api/conversation-token", async (req, res) => {
  if (!ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: "ELEVENLABS_API_KEY is not configured" });
  }

  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/conversation/get_token",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agent_id: ELEVENLABS_AGENT_ID }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error(`ElevenLabs token API error (${response.status}): ${text}`);
      return res
        .status(502)
        .json({ error: "ElevenLabs API request failed" });
    }

    const data = await response.json();
    res.set("Cache-Control", "no-store");
    res.json(data);
  } catch (err) {
    console.error("Failed to reach ElevenLabs API (token):", err.message);
    res.status(502).json({ error: "Failed to reach ElevenLabs API" });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Notan server listening on port ${PORT}`);
  });
}

module.exports = app;
