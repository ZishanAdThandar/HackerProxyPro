// build.js
// Simple build script to produce Firefox & Chrome bundles.

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");
const SRC_FILES = ["background.js", "options.js", "options.html"];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
  console.log("Copied", src, "→", dest);
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Wrote JSON", file);
}

function buildFirefox() {
  const outDir = path.join(DIST, "firefox");
  ensureDir(outDir);

  for (const f of SRC_FILES) {
    copyFile(path.join(ROOT, f), path.join(outDir, f));
  }

  const manifest = readJSON(path.join(ROOT, "manifest.json"));
  writeJSON(path.join(outDir, "manifest.json"), manifest);
}

function buildChrome() {
  const outDir = path.join(DIST, "chrome");
  ensureDir(outDir);

  for (const f of SRC_FILES) {
    copyFile(path.join(ROOT, f), path.join(outDir, f));
  }

  const manifest = readJSON(path.join(ROOT, "manifest.json"));

  // Chrome does not support browser_specific_settings
  delete manifest.browser_specific_settings;

  // Chrome proxy.settings does not need <all_urls>
  if (Array.isArray(manifest.permissions)) {
    manifest.permissions = manifest.permissions.filter(p => p !== "<all_urls>");
  }

  writeJSON(path.join(outDir, "manifest.json"), manifest);
}

function main() {
  ensureDir(DIST);
  buildFirefox();
  buildChrome();
  console.log("Build complete.");
}

main();
