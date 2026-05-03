const MIN_ZOOM = 0.25;
const MAX_ZOOM = 5;
const ZOOM_IN_FACTOR = 1.1;
const ZOOM_OUT_FACTOR = 1 / ZOOM_IN_FACTOR;

function clampZoom(zoomFactor) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomFactor));
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "adjust-zoom") {
    return false;
  }

  const tabId = sender.tab?.id;

  if (typeof tabId !== "number") {
    sendResponse({ ok: false, error: "Missing tab context." });
    return false;
  }

  chrome.tabs.getZoom(tabId, (currentZoom) => {
    if (chrome.runtime.lastError) {
      sendResponse({ ok: false, error: chrome.runtime.lastError.message });
      return;
    }

    const nextZoom = clampZoom(
      currentZoom * (message.direction === "in" ? ZOOM_IN_FACTOR : ZOOM_OUT_FACTOR)
    );

    chrome.tabs.setZoom(tabId, nextZoom, () => {
      if (chrome.runtime.lastError) {
        sendResponse({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }

      sendResponse({ ok: true, zoom: nextZoom });
    });
  });

  return true;
});