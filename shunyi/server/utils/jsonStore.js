import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

function cloneDefault(value) {
  return JSON.parse(JSON.stringify(value));
}

export function ensureDataFile(filePath, defaultValue) {
  mkdirSync(dirname(filePath), { recursive: true });

  if (!existsSync(filePath)) {
    writeJson(filePath, defaultValue);
    return;
  }

  const content = readFileSync(filePath, "utf8");
  if (content.trim().length === 0) {
    writeJson(filePath, defaultValue);
  }
}

export function readJson(filePath, defaultValue) {
  ensureDataFile(filePath, defaultValue);

  try {
    const content = readFileSync(filePath, "utf8").trim();

    if (!content) {
      writeJson(filePath, defaultValue);
      return cloneDefault(defaultValue);
    }

    return JSON.parse(content);
  } catch (error) {
    console.warn(`JSON store damaged, reset with default: ${filePath}`, error);
    writeJson(filePath, defaultValue);
    return cloneDefault(defaultValue);
  }
}

export function writeJson(filePath, data) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function updateJson(filePath, updater, defaultValue = []) {
  const current = readJson(filePath, defaultValue);
  const next = updater(current);
  writeJson(filePath, next);
  return next;
}
