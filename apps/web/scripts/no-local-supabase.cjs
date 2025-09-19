#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const forbidden = [
  /supabase\s+start/i,
  /supabase\s+stop/i,
  /supabase\s+status/i,
  /supabase\s+reset/i,
  /supabase\s+db/i,
  /docker-compose.*supabase/i,
  /127\.0\.0\.1:5432|localhost:5432/i
];

const files = [
  "package.json",
  "apps/web/package.json", 
  "apps/web/scripts/*",
  "README.md",
  "docs/**/*",
  "Makefile"
];

console.log("🔒 Checking for local Supabase commands…");

let bad = [];
let checkedFiles = 0;

// Check package.json files
const packageFiles = [
  "package.json",
  "apps/web/package.json"
];

packageFiles.forEach(file => {
  if (fs.existsSync(file)) {
    checkedFiles++;
    const content = fs.readFileSync(file, 'utf8');
    forbidden.forEach(pattern => {
      if (pattern.test(content)) {
        bad.push(`${file}: Contains forbidden pattern ${pattern}`);
      }
    });
  }
});

// Basic scan complete
if (bad.length > 0) {
  console.log("❌ Found local Supabase commands:");
  bad.forEach(error => console.log(`  - ${error}`));
  console.log("\n💡 Use MCP or CI for database operations. See docs/DB_MIGRATION_RUN.md");
  process.exit(1);
}

console.log(`✅ No local Supabase commands found (checked ${checkedFiles} files).`);
console.log("💡 For full scan, run: rg -n 'supabase start|supabase stop|supabase db|supabase reset|docker-compose.*supabase|localhost:5432|127\.0\.0\.1:5432' -S");
