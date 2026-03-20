#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const TMP_ROOT = path.join(ROOT, "tmp");
const CACHE_EMAIL_ROOT = path.join(ROOT, "cache", "email");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function runGenerate(name, payload) {
  ensureDir(TMP_ROOT);
  const inputPath = path.join(TMP_ROOT, `${name}.json`);
  const outputPath = path.join(TMP_ROOT, `${name}-out`);
  writeJson(inputPath, payload);
  const run = spawnSync("node", ["scripts/generate.js", "--input", inputPath, "--output", outputPath], {
    cwd: ROOT,
    encoding: "utf8"
  });

  if (run.status !== 0) {
    throw new Error(run.stderr || run.stdout || `Generator failed for ${name}`);
  }

  return JSON.parse(run.stdout);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
  fs.rmSync(CACHE_EMAIL_ROOT, { recursive: true, force: true });

  const base = {
    ui_type: "email",
    emails: [
      {
        from: "Security Team",
        subject: "Your code",
        preview: "Use 102938 to continue."
      }
    ],
    features: {
      otp: true,
      search: false
    },
    style: "minimal",
    otp: "102938"
  };

  const first = runGenerate("first", base);
  const second = runGenerate("second", {
    ...base,
    emails: [
      {
        from: "Billing",
        subject: "Invoice ready",
        preview: "Your March invoice is attached."
      }
    ],
    otp: "555444"
  });

  assert(first.cache_status === "miss", "Test 1 first run should miss cache.");
  assert(second.cache_status === "hit", "Test 1 second run should hit cache.");
  assert(first.cache_key === second.cache_key, "Same structure must reuse the same cache key.");

  const third = runGenerate("third", {
    ...base,
    features: {
      otp: true,
      search: true
    }
  });

  assert(third.cache_status === "miss", "Test 2 changed features should create a new cache entry.");
  assert(third.cache_key !== first.cache_key, "Changed features must produce a new cache key.");

  console.log(JSON.stringify({
    test_1: {
      first_run: first.cache_status,
      second_run: second.cache_status,
      reused_cache_key: first.cache_key
    },
    test_2: {
      changed_features_run: third.cache_status,
      new_cache_key: third.cache_key
    }
  }, null, 2));
}

main();
