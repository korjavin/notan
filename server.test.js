const { describe, it, before, after, beforeEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

// We need to mock fetch before requiring the server
let app;
let server;
let baseUrl;

async function request(path) {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}${path}`, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
      res.on("error", reject);
    });
  });
}

describe("server with no API key", () => {
  before(async () => {
    delete process.env.ELEVENLABS_API_KEY;
    // Clear cached module
    delete require.cache[require.resolve("./server")];
    app = require("./server");
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it("GET /api/signed-url returns 500 when API key is missing", async () => {
    const res = await request("/api/signed-url");
    assert.equal(res.status, 500);
    assert.match(res.body.error, /not configured/);
  });

  it("GET /api/conversation-token returns 500 when API key is missing", async () => {
    const res = await request("/api/conversation-token");
    assert.equal(res.status, 500);
    assert.match(res.body.error, /not configured/);
  });
});

describe("server with API key", () => {
  let originalFetch;

  before(async () => {
    process.env.ELEVENLABS_API_KEY = "test-key-123";
    delete require.cache[require.resolve("./server")];
    app = require("./server");
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
    originalFetch = global.fetch;
  });

  after(async () => {
    global.fetch = originalFetch;
    delete process.env.ELEVENLABS_API_KEY;
    await new Promise((resolve) => server.close(resolve));
  });

  it("GET /api/signed-url returns signed URL on success", async () => {
    global.fetch = async (url, opts) => {
      assert.match(url, /get_signed_url/);
      assert.equal(opts.headers["xi-api-key"], "test-key-123");
      return {
        ok: true,
        json: async () => ({ signed_url: "wss://example.com/signed" }),
      };
    };

    const res = await request("/api/signed-url");
    assert.equal(res.status, 200);
    assert.equal(res.body.signed_url, "wss://example.com/signed");
  });

  it("GET /api/signed-url forwards upstream errors", async () => {
    global.fetch = async () => ({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    const res = await request("/api/signed-url");
    assert.equal(res.status, 401);
    assert.match(res.body.error, /Unauthorized/);
  });

  it("GET /api/signed-url returns 502 on network failure", async () => {
    global.fetch = async () => {
      throw new Error("Network error");
    };

    const res = await request("/api/signed-url");
    assert.equal(res.status, 502);
    assert.match(res.body.error, /Network error/);
  });

  it("GET /api/conversation-token returns token on success", async () => {
    global.fetch = async (url, opts) => {
      assert.match(url, /get_token/);
      assert.equal(opts.method, "POST");
      assert.equal(opts.headers["xi-api-key"], "test-key-123");
      return {
        ok: true,
        json: async () => ({ token: "abc123" }),
      };
    };

    const res = await request("/api/conversation-token");
    assert.equal(res.status, 200);
    assert.equal(res.body.token, "abc123");
  });

  it("GET /api/conversation-token forwards upstream errors", async () => {
    global.fetch = async () => ({
      ok: false,
      status: 403,
      text: async () => "Forbidden",
    });

    const res = await request("/api/conversation-token");
    assert.equal(res.status, 403);
    assert.match(res.body.error, /Forbidden/);
  });

  it("GET /api/conversation-token returns 502 on network failure", async () => {
    global.fetch = async () => {
      throw new Error("Connection refused");
    };

    const res = await request("/api/conversation-token");
    assert.equal(res.status, 502);
    assert.match(res.body.error, /Connection refused/);
  });
});
