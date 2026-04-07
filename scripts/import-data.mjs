import process from "node:process";
import { getDatabasePath, getContentCounts } from "../server/database.js";
import { importBase44Exports, resolveExportDirectory } from "../server/importBase44.js";

try {
  process.loadEnvFile?.();
} catch (error) {
  if (error?.code !== "ENOENT") {
    throw error;
  }
}

const shouldReset = process.argv.includes("--reset");
const exportDir = resolveExportDirectory();

if (!exportDir) {
  console.error("No Base44 export directory was found. Expected ./database or ../database.");
  process.exit(1);
}

const result = importBase44Exports({
  exportDir,
  reset: shouldReset,
});

console.log(`Database: ${getDatabasePath()}`);
console.log(`Export directory: ${result.exportDir}`);
console.log(`Imported projects: ${result.counts.projects}`);
console.log(`Imported ctfs: ${result.counts.ctfs}`);
console.log(`Imported courses: ${result.counts.courses}`);
console.log(`Imported site settings: ${result.counts.siteSettings}`);
console.log("Current totals:", getContentCounts());
