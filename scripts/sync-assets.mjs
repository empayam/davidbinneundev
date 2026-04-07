import process from "node:process";

try {
  process.loadEnvFile?.();
} catch (error) {
  if (error?.code !== "ENOENT") {
    throw error;
  }
}

import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  listCourses,
  listCtfs,
  listProjects,
  updateCourse,
  updateCtf,
  updateProject,
} from "../server/database.js";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptsDir, "..");
const uploadSubdirectory = "migrated";
const uploadRoot = process.env.UPLOADS_DIR || path.join(appRoot, "uploads");
const targetDir = path.join(uploadRoot, uploadSubdirectory);

mkdirSync(targetDir, { recursive: true });

function fileExtensionFromUrl(url, contentType = "") {
  const pathname = new URL(url).pathname;
  const extensionFromPath = path.extname(pathname);
  if (extensionFromPath) {
    return extensionFromPath;
  }

  if (contentType.includes("png")) return ".png";
  if (contentType.includes("jpeg")) return ".jpg";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";

  return ".bin";
}

async function downloadAsset(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  const extension = fileExtensionFromUrl(url, response.headers.get("content-type") || "");
  const filename = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(path.join(targetDir, filename), buffer);
  return `/uploads/${uploadSubdirectory}/${filename}`;
}

async function syncCollection(items, field, updateItem) {
  let migratedCount = 0;

  for (const item of items) {
    const currentUrl = item[field];
    if (!currentUrl || currentUrl.startsWith("/uploads/")) {
      continue;
    }

    try {
      const nextUrl = await downloadAsset(currentUrl);
      await updateItem(item.id, { [field]: nextUrl });
      migratedCount += 1;
      console.log(`Migrated ${field} for ${item.id}`);
    } catch (error) {
      console.warn(`Failed to migrate ${field} for ${item.id}: ${error.message}`);
    }
  }

  return migratedCount;
}

const projectCount = await syncCollection(listProjects(), "preview_image", updateProject);
const ctfCount = await syncCollection(listCtfs(), "image", updateCtf);
const courseCount = await syncCollection(listCourses(), "certificate_pdf", updateCourse);

console.log("Asset sync complete.");
console.log(`Projects updated: ${projectCount}`);
console.log(`CTFs updated: ${ctfCount}`);
console.log(`Courses updated: ${courseCount}`);
