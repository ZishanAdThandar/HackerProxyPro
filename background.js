// Hacker Proxy Pro – Restart-Safe Background Script (MV2)

const isFirefox = typeof browser !== "undefined";
const api = isFirefox ? browser : chrome;

// Modes definition (Direct is always enabled)
const MODES = [
  { id: "none",   label: "Direct (no proxy)" },
  { id: "burp",   label: "Burp Suite – 127.0.0.1:8080" },
  { id: "tor",    label: "Tor – 127.0.0.1:9050" },
  { id: "custom", label: "Custom" }
];

const DEFAULT_ENABLED = { burp: true, tor: true, custom: false };
const DEFAULT_CUSTOM  = { type: "http", host: "127.0.0.1", port: 8080 };

// ---------------------------- ICON CACHE ----------------------------

const iconCache = new Map();

function getIconData(mode) {
  const key = mode === "off" ? "none" : mode;
  if (iconCache.has(key)) return iconCache.get(key);

  const icons = {
    none: {
      "16": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjNjY2NjY2IiByeD0iMiIvPgo8dGV4dCB4PSI4IiB5PSIxMiIgZm9udC1mYW1pbHk9Ik1vbmFzcGFjZSxDb3VyaWVyIE5ldyIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRkZGRkYiPkg8L3RleHQ+Cjwvc3ZnPgo=",
      "32": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjNjY2NjY2IiByeD0iMyIvPgo8dGV4dCB4PSIxNiIgeT0iMjIiIGZvbnQtZmFtaWx5PSJNb25hc3BhY2UsQ291cmllciBOZXciIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIj5IPC90ZXh0Pgo8L3N2Zz4K",
      "48": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjNjY2NjY2IiByeD0iNCIvPgo8dGV4dCB4PSIyNCIgeT0iMzIiIGZvbnQtZmFtaWx5PSJNb25hc3BhY2UsQ291cmllciBOZXciIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIj5IPC90ZXh0Pgo8L3N2Zz4K"
    },
    burp: {
      "16": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjMDBGRjQxIiByeD0iMiIvPgo8dGV4dCB4PSI4IiB5PSIxMiIgZm9udC1mYW1pbHk9Ik1vbmFzcGFjZSxDb3VyaWVyIE5ldyIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMDAiPkg8L3RleHQ+Cjwvc3ZnPgo=",
      "32": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMDBGRjQxIiByeD0iMyIvPgo8dGV4dCB4PSIxNiIgeT0iMjIiIGZvbnQtZmFtaWx5PSJNb25hc3BhY2UsQ291cmllciBOZXciIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwIj5IPC90ZXh0Pgo8L3N2Zz4K",
      "48": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMDBGRjQxIiByeD0iNCIvPgo8dGV4dCB4PSIyNCIgeT0iMzIiIGZvbnQtZmFtaWx5PSJNb25hc3BhY2UsQ291cmllciBOZXciIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwIj5IPC90ZXh0Pgo8L3N2Zz4K"
    },
    tor: {
      "16": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjODA0MEEwIiByeD0iMiIvPgo8dGV4dCB4PSI4IiB5PSIxMiIgZm9udC1mYW1pbHk9Ik1vbmFzcGFjZSxDb3VyaWVyIE5ldyIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRkZGRkYiPkg8L3RleHQ+Cjwvc3ZnPgo=",
      "32": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjODA0MEEwIiByeD0iMyIvPgo8dGV4dCB4PSIxNiIgeT0iMjIiIGZvbnQtZmFtaWx5PSJNb25hc3BhY2UsQ291cmllciBOZXciIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIj5IPC90ZXh0Pgo8L3N2Zz4K",
      "48": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjODA0MEEwIiByeD0iNCIvPgo8dGV4dCB4PSIyNCIgeT0iMzIiIGZvbnQtZmFtaWx5PSJNb25hc3BhY2UsQ291cmllciBOZXciIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIj5IPC90ZXh0Pgo8L3N2Zz4K"
    },
    custom: {
      "16": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjMDA4MEZGIiByeD0iMiIvPgo8dGV4dCB4PSI4IiB5PSIxMiIgZm9udC1mYW1pbHk9Ik1vbmFzcGFjZSxDb3VyaWVyIE5ldyIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRkZGRkYiPkM8L3RleHQ+Cjwvc3ZnPgo=",
      "32": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMDA4MEZGIiByeD0iMyIvPgo8dGV4dCB4PSIxNiIgeT0iMjIiIGZvbnQtZmFtaWx5PSJNb25hc3BhY2UsQ291cmllciBOZXciIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIj5DPC90ZXh0Pgo8L3N2Zz4K",
      "48": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMDA4MEZGIiByeD0iNCIvPgo8dGV4dCB4PSIyNCIgeT0iMzIiIGZvbnQtZmFtaWx5PSJNb25hc3BhY2UsQ291cmllciBOZXciIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIj5DPC90ZXh0Pgo8L3N2Zz4K"
    }
  };

  const data = icons[key] || icons.none;
  iconCache.set(key, data);
  return data;
}

// ---------------------------- STORAGE HELPERS ----------------------------

function getStoredModeId(defaultId = "none") {
  return new Promise(resolve => {
    api.storage.local.get({ modeId: defaultId }, result =>
      resolve(result.modeId || defaultId)
    );
  });
}

function setStoredModeId(id) {
  api.storage.local.set({ modeId: id });
}

function getEnabledModes() {
  return new Promise(resolve => {
    api.storage.local.get({ enabled: DEFAULT_ENABLED }, result =>
      resolve(result.enabled || DEFAULT_ENABLED)
    );
  });
}

function getCustomProxy() {
  return new Promise(resolve => {
    api.storage.local.get({ customProxy: DEFAULT_CUSTOM }, result =>
      resolve(result.customProxy || DEFAULT_CUSTOM)
    );
  });
}

// ---------------------------- MODE STATE ----------------------------

// In-memory cache so the per-request Firefox proxy handler stays fast.
let currentModeId = "none";
let customProxyCache = DEFAULT_CUSTOM;

function getModeById(id) {
  return MODES.find(m => m.id === id) || MODES[0];
}

async function getEnabledModeList() {
  const enabled = await getEnabledModes();
  return MODES.filter(m => m.id === "none" || enabled[m.id]);
}

async function getNextModeId(id) {
  const list = await getEnabledModeList();
  const i = list.findIndex(m => m.id === id);
  return list[(i + 1) % list.length].id;
}

async function sanitizeMode() {
  const stored = await getStoredModeId("none");
  const list = await getEnabledModeList();

  if (!list.some(m => m.id === stored)) {
    setStoredModeId("none");
    currentModeId = "none";
    return "none";
  }

  currentModeId = stored;
  return stored;
}

// ---------------------------- FIREFOX PROXY ----------------------------

function firefoxProxyHandler() {
  switch (currentModeId) {
    case "burp":
      return { type: "http", host: "127.0.0.1", port: 8080 };
    case "tor":
      return { type: "socks", host: "127.0.0.1", port: 9050, proxyDNS: true };
    case "custom": {
      const cfg = customProxyCache;
      const result = { type: cfg.type, host: cfg.host, port: cfg.port };
      if (cfg.type === "socks") result.proxyDNS = true;
      return result;
    }
    default:
      return { type: "direct" };
  }
}

async function applyFirefoxProxy() {
  if (!api.proxy || !api.proxy.onRequest) return;

  if (api.proxy.onRequest.hasListener(firefoxProxyHandler))
    api.proxy.onRequest.removeListener(firefoxProxyHandler);

  if (currentModeId === "none") return;

  api.proxy.onRequest.addListener(firefoxProxyHandler, { urls: ["<all_urls>"] });
}

// ---------------------------- CHROME PROXY ----------------------------

async function applyChromeProxy() {
  const id = currentModeId;

  if (id === "none") {
    api.proxy.settings.set({
      value: { mode: "direct" },
      scope: "regular"
    });
    return;
  }

  let scheme, host, port;

  if (id === "burp") {
    scheme = "http"; host = "127.0.0.1"; port = 8080;
  } else if (id === "tor") {
    scheme = "socks5"; host = "127.0.0.1"; port = 9050;
  } else if (id === "custom") {
    const cfg = customProxyCache;
    scheme = cfg.type === "socks" ? "socks5" : cfg.type;
    host = cfg.host; port = cfg.port;
  }

  api.proxy.settings.set({
    value: {
      mode: "fixed_servers",
      rules: {
        singleProxy: { scheme, host, port },
        bypassList: ["<local>"]
      }
    },
    scope: "regular"
  });
}

// ---------------------------- UI ICON + BADGE ----------------------------

async function updateBrowserAction() {
  const mode = getModeById(currentModeId);
  const action = api.browserAction;

  action.setTitle({ title: "Hacker Proxy Pro – " + mode.label });
  action.setIcon({ path: getIconData(mode.id) });

  if (mode.id === "burp") {
    action.setBadgeText({ text: "Burp" });
    action.setBadgeBackgroundColor({ color: [0, 255, 65, 255] });
  } else if (mode.id === "tor") {
    action.setBadgeText({ text: "Tor" });
    action.setBadgeBackgroundColor({ color: [128, 64, 160, 255] });
  } else if (mode.id === "custom") {
    action.setBadgeText({ text: "Cust" });
    action.setBadgeBackgroundColor({ color: [0, 128, 255, 255] });
  } else {
    action.setBadgeText({ text: "" });
  }
}

// ---------------------------- APPLY MODE ----------------------------

async function applyMode() {
  const id = await sanitizeMode();
  currentModeId = id;

  if (isFirefox) await applyFirefoxProxy();
  else await applyChromeProxy();

  await updateBrowserAction();
}

// ---------------------------- INIT ----------------------------

async function init() {
  const custom = await getCustomProxy();
  customProxyCache = custom;

  await applyMode();
}

// ---------------------------- EVENTS ----------------------------

// On click (or keyboard shortcut): switch mode and apply
if (api.browserAction && api.browserAction.onClicked) {
  api.browserAction.onClicked.addListener(async () => {
    const next = await getNextModeId(currentModeId);
    if (next === currentModeId) return;

    currentModeId = next;
    setStoredModeId(next);
    applyMode();
  });
}

// React to changes from the options page
if (api.storage && api.storage.onChanged) {
  api.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;

    if (changes.customProxy) customProxyCache = changes.customProxy.newValue;

    if (changes.enabled || changes.customProxy) {
      applyMode();
    }
  });
}

// Ensure restore after sleep/startup
if (api.runtime.onStartup)
  api.runtime.onStartup.addListener(init);

if (api.runtime.onInstalled)
  api.runtime.onInstalled.addListener(init);

// First run
init();