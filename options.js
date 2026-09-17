// Hacker Proxy Pro – Options Page

const api = typeof browser !== "undefined" ? browser : chrome;
const isFirefox = typeof browser !== "undefined";

const $ = id => document.getElementById(id);

const DEFAULT_ENABLED = { burp: true, tor: true, custom: false };
const DEFAULT_CUSTOM  = { type: "http", host: "127.0.0.1", port: 8080 };

const MODE_LABELS = {
  none: "Direct (no proxy)",
  burp: "Burp Suite",
  tor: "Tor",
  custom: "Custom"
};

const MODE_COLORS = {
  none: "#666",
  burp: "#009933",
  tor: "#7b2d8b",
  custom: "#005fcc"
};

const PERMISSIONS = {
  "proxy": "Set and manage how your web traffic is routed.",
  "storage": "Remember your selected mode and settings.",
  "<all_urls>": "Access all URLs to route traffic through the proxy (Firefox only)."
};

function read(key, fallback) {
  return new Promise(resolve =>
    api.storage.local.get({ [key]: fallback }, r => resolve(r[key] ?? fallback))
  );
}

function write(key, value) {
  api.storage.local.set({ [key]: value });
}

function showMsg(text, color) {
  const el = $("form-msg");
  el.textContent = text;
  el.style.color = color || "#888";
  el.hidden = false;
}

async function init() {
  const enabled = await read("enabled", DEFAULT_ENABLED);
  const custom = await read("customProxy", DEFAULT_CUSTOM);
  const modeId = await read("modeId", "none");

  $("enabled-burp").checked = !!enabled.burp;
  $("enabled-tor").checked = !!enabled.tor;
  $("enabled-custom").checked = !!enabled.custom;

  $("custom-type").value = custom.type;
  $("custom-host").value = custom.host;
  $("custom-port").value = custom.port;

  const active = $("active-mode");
  active.textContent = "Currently active: " + (MODE_LABELS[modeId] || modeId);
  active.style.color = MODE_COLORS[modeId] || "#888";

  syncCustomSection();
  renderPermissions();
}

function saveCustom() {
  const type = $("custom-type").value;
  const host = $("custom-host").value.trim();
  const port = parseInt($("custom-port").value, 10);

  if (!host || host.includes("/")) {
    return showMsg("Enter a valid proxy host.", "#e74c3c");
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return showMsg("Port must be between 1 and 65535.", "#e74c3c");
  }

  write("customProxy", { type, host, port });
  showMsg("Saved.", "#27ae60");
  setTimeout(() => { $("form-msg").hidden = true; }, 1500);
}

function syncCustomSection() {
  $("custom-section").hidden = !$("enabled-custom").checked;
}

function renderPermissions() {
  const ul = $("permissions-list");
  ul.replaceChildren();
  for (const [name, why] of Object.entries(PERMISSIONS)) {
    if (name === "<all_urls>" && !isFirefox) continue;
    const li = document.createElement("li");
    const code = document.createElement("code");
    code.textContent = name;
    li.append(code);
    li.append(document.createTextNode(" — " + why));
    ul.appendChild(li);
  }
}

function bindToggle(id, key) {
  $(id).addEventListener("change", async () => {
    const enabled = await read("enabled", DEFAULT_ENABLED);
    enabled.burp = $("enabled-burp").checked;
    enabled.tor = $("enabled-tor").checked;
    enabled.custom = $("enabled-custom").checked;
    write("enabled", enabled);
    syncCustomSection();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  $("save-custom").addEventListener("click", saveCustom);
  for (const id of ["enabled-burp", "enabled-tor", "enabled-custom"]) {
    bindToggle(id);
  }
});