let rightButtonDown = false;
let suppressContextMenu = false;

function syncRightButtonState(event) {
  rightButtonDown = (event.buttons & 2) === 2;
}

function requestZoom(direction) {
  chrome.runtime.sendMessage({ type: "adjust-zoom", direction }, () => {
    void chrome.runtime.lastError;
  });
}

window.addEventListener(
  "mousedown",
  (event) => {
    if (event.button === 2) {
      rightButtonDown = true;
      suppressContextMenu = false;
    }
  },
  true
);

window.addEventListener(
  "mouseup",
  (event) => {
    if (event.button === 2) {
      rightButtonDown = false;
    }
  },
  true
);

window.addEventListener(
  "blur",
  () => {
    rightButtonDown = false;
    suppressContextMenu = false;
  },
  true
);

window.addEventListener(
  "contextmenu",
  (event) => {
    if (suppressContextMenu) {
      event.preventDefault();
      event.stopPropagation();
      suppressContextMenu = false;
    }
  },
  true
);

window.addEventListener(
  "wheel",
  (event) => {
    syncRightButtonState(event);

    if (!rightButtonDown || event.deltaY === 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    suppressContextMenu = true;
    requestZoom(event.deltaY < 0 ? "in" : "out");
  },
  {
    capture: true,
    passive: false
  }
);