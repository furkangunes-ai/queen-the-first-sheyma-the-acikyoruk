/**
 * console.error → logApiError migration script.
 * Tüm app/api/ altındaki route dosyalarında console.error'ları logApiError ile değiştirir.
 * Kullanım: npx tsx scripts/migrate-console-to-logger.ts
 */
import * as fs from "fs";
import * as path from "path";

const API_DIR = path.join(process.cwd(), "app", "api");
const IMPORT_LINE = 'import { logApiError } from "@/lib/logger";';

function findTsFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findTsFiles(fullPath));
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      results.push(fullPath);
    }
  }
  return results;
}

function getRouteName(filePath: string): string {
  const rel = path.relative(API_DIR, filePath);
  return rel
    .replace(/\/route\.ts$/, "")
    .replace(/\[([^\]]+)\]/g, ":$1")
    .replace(/\//g, "/");
}

let totalFiles = 0;
let totalReplacements = 0;

for (const file of findTsFiles(API_DIR)) {
  let content = fs.readFileSync(file, "utf-8");
  if (!content.includes("console.error")) continue;

  const routeName = getRouteName(file);
  let replacements = 0;

  // Replace console.error("message", variable) → logApiError("route", variable)
  // Pattern: console.error("...", someVar); or console.error("...", someVar)
  content = content.replace(
    /console\.error\(\s*"([^"]+)",\s*(\w+)\s*\)/g,
    (_match, _msg, varName) => {
      replacements++;
      return `logApiError("${routeName}", ${varName})`;
    }
  );

  // Also handle: console.error("message string only") → logger.error("message")
  // These are rare, skip for now

  if (replacements > 0) {
    // Add import if not already present
    if (!content.includes('from "@/lib/logger"')) {
      // Find the last import line and add after it
      const lines = content.split("\n");
      let lastImportIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("import ")) {
          lastImportIndex = i;
        }
      }
      if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0, IMPORT_LINE);
        content = lines.join("\n");
      }
    }

    fs.writeFileSync(file, content, "utf-8");
    totalFiles++;
    totalReplacements += replacements;
    console.log(`  ${routeName}: ${replacements} replacement(s)`);
  }
}

console.log(`\nDone: ${totalReplacements} replacements across ${totalFiles} files.`);
