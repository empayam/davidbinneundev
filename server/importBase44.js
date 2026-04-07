import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parse as parseCsv } from "csv-parse/sync";
import {
  clearContentTables,
  createCourse,
  createCtf,
  createProject,
  createSiteSettings,
  getContentCounts,
  getDatabase,
} from "./database.js";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(serverDir, "..");

const exportFileMap = {
  projects: "Project_export.csv",
  ctfs: "CTF_export.csv",
  courses: "Course_export.csv",
  siteSettings: "SiteSettings_export.csv",
};

function candidateExportDirs() {
  return [
    process.env.BASE44_EXPORT_DIR,
    path.join(appRoot, "database"),
    path.join(appRoot, "..", "database"),
  ].filter(Boolean);
}

export function resolveExportDirectory() {
  return candidateExportDirs().find((dirPath) => existsSync(dirPath)) || null;
}

function readCsvRows(filePath) {
  const fileContents = readFileSync(filePath, "utf8");
  return parseCsv(fileContents, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
  });
}

function parseJsonField(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function importProjects(exportDir) {
  const rows = readCsvRows(path.join(exportDir, exportFileMap.projects));
  rows.forEach((row) => {
    createProject({
      id: row.id,
      title: row.title,
      description: row.description,
      preview_image: row.preview_image,
      live_link: row.live_link,
      github_link: row.github_link,
      technologies: parseJsonField(row.technologies, []),
      featured: row.featured,
      order: row.order,
      created_date: row.created_date,
      updated_date: row.updated_date,
    });
  });

  return rows.length;
}

function importCtfs(exportDir) {
  const rows = readCsvRows(path.join(exportDir, exportFileMap.ctfs));
  rows.forEach((row) => {
    createCtf({
      id: row.id,
      title: row.title,
      platform: row.platform,
      description: row.description,
      topic: row.topic,
      difficulty: row.difficulty,
      technologies: parseJsonField(row.technologies, []),
      image: row.image,
      writeup_link: row.writeup_link,
      completed_date: row.completed_date,
      order: row.order,
      created_date: row.created_date,
      updated_date: row.updated_date,
    });
  });

  return rows.length;
}

function importCourses(exportDir) {
  const rows = readCsvRows(path.join(exportDir, exportFileMap.courses));
  rows.forEach((row) => {
    createCourse({
      id: row.id,
      title: row.title,
      provider: row.provider,
      description: row.description,
      certificate_link: row.certificate_link,
      certificate_pdf: row.certificate_pdf,
      technologies: parseJsonField(row.technologies, []),
      months: row.months,
      order: row.order,
      created_date: row.created_date,
      updated_date: row.updated_date,
    });
  });

  return rows.length;
}

function importSiteSettings(exportDir) {
  const rows = readCsvRows(path.join(exportDir, exportFileMap.siteSettings));
  rows.forEach((row) => {
    createSiteSettings({
      id: row.id,
      key: row.key,
      developer_name: row.developer_name,
      developer_role: row.developer_role,
      developer_bio: row.developer_bio,
      developer_focus: parseJsonField(row.developer_focus, []),
      skill_categories: parseJsonField(row.skill_categories, []),
      social_links: parseJsonField(row.social_links, []),
      floating_technologies: parseJsonField(row.floating_technologies, []),
      created_date: row.created_date,
      updated_date: row.updated_date,
    });
  });

  return rows.length;
}

export function importBase44Exports({ exportDir = resolveExportDirectory(), reset = false } = {}) {
  if (!exportDir) {
    return {
      imported: false,
      reason: "export_directory_not_found",
      counts: getContentCounts(),
    };
  }

  getDatabase();

  if (reset) {
    clearContentTables();
  }

  const db = getDatabase();
  db.exec("BEGIN");

  try {
    const summary = {
      projects: importProjects(exportDir),
      ctfs: importCtfs(exportDir),
      courses: importCourses(exportDir),
      siteSettings: importSiteSettings(exportDir),
    };
    db.exec("COMMIT");

    return {
      imported: true,
      exportDir,
      counts: summary,
    };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
