const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

// Minimal DOM shim for testing
function createDomShim() {
  const elements = {};
  const listeners = {};

  const createElement = (id, initial = {}) => {
    const attrs = {};
    elements[id] = {
      get textContent() { return initial.textContent || ""; },
      set textContent(v) { initial.textContent = v; },
      get hidden() { return initial.hidden || false; },
      set hidden(v) { initial.hidden = v; },
      className: initial.className || "",
      setAttribute(name, value) { attrs[name] = value; },
      getAttribute(name) { return attrs[name]; },
    };
    return elements[id];
  };

  return {
    elements,
    install() {
      global.document = {
        getElementById(id) { return elements[id] || null; },
        addEventListener(event, fn) {
          listeners[event] = listeners[event] || [];
          listeners[event].push(fn);
        },
      };
      global.window = {};
    },
    cleanup() {
      delete global.document;
      delete global.window;
      delete global.fetch;
    },
    createElement,
    fire(event) {
      (listeners[event] || []).forEach(fn => fn());
    },
  };
}

describe("fetchSignedUrl", () => {
  let fetchSignedUrl;
  const dom = createDomShim();

  beforeEach(() => {
    dom.install();
    delete require.cache[require.resolve("./public/app")];
    const mod = require("./public/app");
    fetchSignedUrl = mod.fetchSignedUrl;
  });

  it("returns signed_url on success", async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => ({ signed_url: "wss://test.example.com/signed" }),
    });

    const url = await fetchSignedUrl();
    assert.equal(url, "wss://test.example.com/signed");
    dom.cleanup();
  });

  it("throws on non-ok response with error message", async () => {
    global.fetch = async () => ({
      ok: false,
      json: async () => ({ error: "API key missing" }),
    });

    await assert.rejects(() => fetchSignedUrl(), { message: "API key missing" });
    dom.cleanup();
  });

  it("throws when response is ok but signed_url is missing", async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => ({}),
    });

    await assert.rejects(() => fetchSignedUrl(), { message: "Response missing signed_url" });
    dom.cleanup();
  });

  it("throws with default message when no error field", async () => {
    global.fetch = async () => ({
      ok: false,
      json: async () => ({}),
    });

    await assert.rejects(() => fetchSignedUrl(), { message: "Failed to get signed URL" });
    dom.cleanup();
  });
});

describe("showStatus", () => {
  let showStatus;
  const dom = createDomShim();

  beforeEach(() => {
    dom.install();
    dom.createElement("status", { textContent: "", className: "" });
    delete require.cache[require.resolve("./public/app")];
    const mod = require("./public/app");
    showStatus = mod.showStatus;
  });

  it("sets text and class", () => {
    showStatus("Connected", "connected");
    assert.equal(dom.elements.status.textContent, "Connected");
    assert.equal(dom.elements.status.className, "status connected");
    dom.cleanup();
  });

  it("sets class without type", () => {
    showStatus("Loading");
    assert.equal(dom.elements.status.textContent, "Loading");
    assert.equal(dom.elements.status.className, "status");
    dom.cleanup();
  });
});

describe("showError / hideError", () => {
  let showError, hideError;
  const dom = createDomShim();

  beforeEach(() => {
    dom.install();
    dom.createElement("status", { textContent: "", className: "" });
    dom.createElement("error", { textContent: "", hidden: true });
    delete require.cache[require.resolve("./public/app")];
    const mod = require("./public/app");
    showError = mod.showError;
    hideError = mod.hideError;
  });

  it("shows error message and unhides element", () => {
    showError("Something went wrong");
    assert.equal(dom.elements.error.textContent, "Something went wrong");
    assert.equal(dom.elements.error.hidden, false);
    assert.equal(dom.elements.status.className, "status error");
    dom.cleanup();
  });

  it("hides error element", () => {
    dom.elements.error.hidden = false;
    hideError();
    assert.equal(dom.elements.error.hidden, true);
    dom.cleanup();
  });
});

describe("init", () => {
  let init;
  const dom = createDomShim();

  beforeEach(() => {
    dom.install();
    dom.createElement("status", { textContent: "", className: "" });
    dom.createElement("error", { textContent: "", hidden: true });
    dom.createElement("widget", {});
    delete require.cache[require.resolve("./public/app")];
    const mod = require("./public/app");
    init = mod.init;
  });

  it("fetches signed URL and sets it on the widget", async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => ({ signed_url: "wss://signed.test" }),
    });

    await init();
    assert.equal(dom.elements.widget.getAttribute("signed-url"), "wss://signed.test");
    assert.equal(dom.elements.status.textContent, "Connected");
    assert.equal(dom.elements.status.className, "status connected");
    dom.cleanup();
  });

  it("shows error when fetch fails", async () => {
    global.fetch = async () => ({
      ok: false,
      json: async () => ({ error: "Server error" }),
    });

    await init();
    assert.equal(dom.elements.error.textContent, "Server error");
    assert.equal(dom.elements.error.hidden, false);
    dom.cleanup();
  });
});
