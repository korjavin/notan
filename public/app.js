async function fetchSignedUrl() {
  const response = await fetch("/api/signed-url");
  if (!response.ok) {
    let message = "Failed to get signed URL";
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {}
    throw new Error(message);
  }
  const data = await response.json();
  if (!data.signed_url) {
    throw new Error("Response missing signed_url");
  }
  return data.signed_url;
}

function showStatus(message, type) {
  const el = document.getElementById("status");
  if (!el) return;
  el.textContent = message;
  el.className = "status" + (type ? " " + type : "");
}

function showError(message) {
  const el = document.getElementById("error");
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  showStatus("Error", "error");
}

function hideError() {
  const el = document.getElementById("error");
  if (!el) return;
  el.hidden = true;
}

async function init() {
  hideError();
  showStatus("Connecting...");

  try {
    const signedUrl = await fetchSignedUrl();
    const widget = document.getElementById("widget");
    if (widget) {
      widget.setAttribute("signed-url", signedUrl);
    }
    showStatus("Connected", "connected");
  } catch (err) {
    showError(err.message);
  }
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", init);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { fetchSignedUrl, showStatus, showError, hideError, init };
}
