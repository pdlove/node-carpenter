// configManager.js
import fs from "fs";
import path from "path";

// Find project root by walking up until we see package.json
function findProjectRoot(startDir = process.cwd()) {
  let dir = startDir;
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  throw new Error("Could not find project root (no package.json found).");
}

const projectRoot = findProjectRoot();
const CONFIG_FILE = path.join(projectRoot, "config.json");

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.warn(`⚠️ ${CONFIG_FILE} not found, creating a new one.`);
    saveConfig({});
  }

  const raw = fs.readFileSync(CONFIG_FILE, "utf8");
  return JSON.parse(raw || "{}");
}

function saveConfig(newConfig) {
  const content = JSON.stringify(newConfig, null, 2); // pretty print
  fs.writeFileSync(CONFIG_FILE, content, "utf8");
  return newConfig;
}

export default {
  loadConfig,
  saveConfig,
  CONFIG_FILE,
};
