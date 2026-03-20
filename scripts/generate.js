#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const TEMPLATE_ROOT = path.join(ROOT, "templates", "email-ui-base");
const CACHE_ROOT = path.join(ROOT, "cache");
const DEFAULT_OUTPUT_ROOT = path.join(ROOT, "generated-project");

function stableSort(value) {
  if (Array.isArray(value)) {
    return value.map(stableSort);
  }
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((accumulator, key) => {
      accumulator[key] = stableSort(value[key]);
      return accumulator;
    }, {});
  }
  return value;
}

function stableStringify(value) {
  return JSON.stringify(stableSort(value));
}

function normalizeInput(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Input must be a JSON object.");
  }

  const uiType = String(input.ui_type || "").trim().toLowerCase();
  if (uiType !== "email") {
    throw new Error(`Unsupported ui_type "${input.ui_type}". Only "email" is supported.`);
  }

  return {
    ui_type: uiType,
    emails: Array.isArray(input.emails) ? input.emails : [],
    features: stableSort(input.features && typeof input.features === "object" ? input.features : {}),
    style: String(input.style || "minimal").trim().toLowerCase(),
    otp: input.otp == null ? "" : String(input.otp)
  };
}

function computeCacheKey(normalizedInput) {
  const structuralPayload = {
    ui_type: normalizedInput.ui_type,
    features: normalizedInput.features,
    style: normalizedInput.style
  };
  return crypto.createHash("sha256").update(stableStringify(structuralPayload)).digest("hex").slice(0, 16);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDir(source, destination) {
  fs.cpSync(source, destination, { recursive: true });
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function parseArgs(argv) {
  const args = {
    inputPath: null,
    outputPath: DEFAULT_OUTPUT_ROOT
  };

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--input") {
      args.inputPath = argv[index + 1];
      index += 1;
      continue;
    }
    if (token === "--output") {
      args.outputPath = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
  }

  if (!args.inputPath) {
    throw new Error("Usage: node scripts/generate.js --input <json-file> [--output <dir>]");
  }

  return args;
}

function main() {
  const { inputPath, outputPath } = parseArgs(process.argv);
  const input = JSON.parse(fs.readFileSync(path.resolve(inputPath), "utf8"));
  const normalized = normalizeInput(input);
  const cacheKey = computeCacheKey(normalized);
  const cacheDir = path.join(CACHE_ROOT, normalized.ui_type, cacheKey);
  const cacheExists = fs.existsSync(cacheDir);
  const sourceDir = cacheExists ? cacheDir : TEMPLATE_ROOT;

  if (!cacheExists) {
    ensureDir(path.dirname(cacheDir));
    copyDir(TEMPLATE_ROOT, cacheDir);
    writeJson(path.join(cacheDir, "template-meta.json"), {
      ui_type: normalized.ui_type,
      features: normalized.features,
      style: normalized.style,
      cache_key: cacheKey
    });
  }

  fs.rmSync(outputPath, { recursive: true, force: true });
  ensureDir(path.dirname(outputPath));
  copyDir(sourceDir, outputPath);

  writeJson(path.join(outputPath, "data.json"), {
    ui_type: normalized.ui_type,
    features: normalized.features,
    style: normalized.style,
    emails: normalized.emails,
    otp: normalized.otp
  });

  const result = {
    explanation: [
      "Normalizes input and hashes structural fields only.",
      "Reuses cached UI structure when ui_type, features, and style match.",
      "Injects runtime data into generated-project/data.json.",
      "Returns a ready-to-run local project with window.demoAPI."
    ],
    cache_key: cacheKey,
    cache_status: cacheExists ? "hit" : "miss",
    cache_dir: cacheDir,
    output_dir: outputPath,
    generated_files: fs.readdirSync(outputPath).sort()
  };

  console.log(JSON.stringify(result, null, 2));
}

main();
