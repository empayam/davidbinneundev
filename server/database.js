import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(serverDir, "..");

let database;

function getDataDir() {
  return process.env.DATA_DIR || path.join(appRoot, "data");
}

function resolveDatabasePath() {
  return process.env.DATABASE_PATH || path.join(getDataDir(), "app.db");
}

function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function nowIso() {
  return new Date().toISOString();
}

function stringValue(value, fallback = "") {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}

function numberValue(value, fallback = 0) {
  if (value === "" || value === null || value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function booleanValue(value) {
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  return String(value).toLowerCase() === "true" ? 1 : 0;
}

function parseJson(value, fallback) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (Array.isArray(value) || typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function stringifyJson(value, fallback) {
  const parsed = parseJson(value, fallback);
  return JSON.stringify(parsed);
}

function insertRecord(table, record) {
  const keys = Object.keys(record);
  const placeholders = keys.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
  getDatabase()
    .prepare(sql)
    .run(...keys.map((key) => record[key]));
}

function updateRecord(table, id, record) {
  const keys = Object.keys(record);
  const assignments = keys.map((key) => `${key} = ?`).join(", ");
  const sql = `UPDATE ${table} SET ${assignments} WHERE id = ?`;
  getDatabase()
    .prepare(sql)
    .run(...keys.map((key) => record[key]), id);
}

function deleteRecord(table, id) {
  getDatabase().prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
}

function nextOrder(table) {
  const row = getDatabase()
    .prepare(`SELECT COALESCE(MAX(order_index), -1) + 1 AS next_order FROM ${table}`)
    .get();
  return row?.next_order ?? 0;
}

function mapProject(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    preview_image: row.preview_image,
    live_link: row.live_link,
    github_link: row.github_link,
    technologies: parseJson(row.technologies_json, []),
    featured: Boolean(row.featured),
    order: row.order_index ?? 0,
    created_date: row.created_date,
    updated_date: row.updated_date,
  };
}

function mapCtf(row) {
  return {
    id: row.id,
    title: row.title,
    platform: row.platform,
    description: row.description,
    topic: row.topic,
    difficulty: row.difficulty,
    technologies: parseJson(row.technologies_json, []),
    image: row.image,
    writeup_link: row.writeup_link,
    completed_date: row.completed_date,
    order: row.order_index ?? 0,
    created_date: row.created_date,
    updated_date: row.updated_date,
  };
}

function mapCourse(row) {
  return {
    id: row.id,
    title: row.title,
    provider: row.provider,
    description: row.description,
    certificate_link: row.certificate_link,
    certificate_pdf: row.certificate_pdf,
    technologies: parseJson(row.technologies_json, []),
    months: row.months ?? 0,
    order: row.order_index ?? 0,
    created_date: row.created_date,
    updated_date: row.updated_date,
  };
}

function mapSiteSettings(row) {
  return {
    id: row.id,
    key: row.setting_key,
    developer_name: row.developer_name,
    developer_role: row.developer_role,
    developer_bio: row.developer_bio,
    developer_focus: parseJson(row.developer_focus_json, []),
    skill_categories: parseJson(row.skill_categories_json, []),
    social_links: parseJson(row.social_links_json, []),
    floating_technologies: parseJson(row.floating_technologies_json, []),
    created_date: row.created_date,
    updated_date: row.updated_date,
  };
}

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    password_hash: row.password_hash,
    created_date: row.created_date,
    updated_date: row.updated_date,
  };
}

function prepareProject(data, existing = null) {
  return {
    id: existing?.id || stringValue(data.id, randomUUID()),
    title: stringValue(data.title),
    description: stringValue(data.description),
    preview_image: stringValue(data.preview_image),
    live_link: stringValue(data.live_link),
    github_link: stringValue(data.github_link),
    technologies_json: stringifyJson(data.technologies, []),
    featured: booleanValue(data.featured),
    order_index: numberValue(data.order, existing?.order_index ?? nextOrder("projects")),
    created_date: existing?.created_date || stringValue(data.created_date, nowIso()),
    updated_date: stringValue(data.updated_date, nowIso()),
  };
}

function prepareCtf(data, existing = null) {
  return {
    id: existing?.id || stringValue(data.id, randomUUID()),
    title: stringValue(data.title),
    platform: stringValue(data.platform),
    description: stringValue(data.description),
    topic: stringValue(data.topic),
    difficulty: stringValue(data.difficulty, "Medium"),
    technologies_json: stringifyJson(data.technologies, []),
    image: stringValue(data.image),
    writeup_link: stringValue(data.writeup_link),
    completed_date: stringValue(data.completed_date),
    order_index: numberValue(data.order, existing?.order_index ?? nextOrder("ctfs")),
    created_date: existing?.created_date || stringValue(data.created_date, nowIso()),
    updated_date: stringValue(data.updated_date, nowIso()),
  };
}

function prepareCourse(data, existing = null) {
  return {
    id: existing?.id || stringValue(data.id, randomUUID()),
    title: stringValue(data.title),
    provider: stringValue(data.provider),
    description: stringValue(data.description),
    certificate_link: stringValue(data.certificate_link),
    certificate_pdf: stringValue(data.certificate_pdf),
    technologies_json: stringifyJson(data.technologies, []),
    months: numberValue(data.months, 0),
    order_index: numberValue(data.order, existing?.order_index ?? nextOrder("courses")),
    created_date: existing?.created_date || stringValue(data.created_date, nowIso()),
    updated_date: stringValue(data.updated_date, nowIso()),
  };
}

function prepareSiteSettings(data, existing = null) {
  return {
    id: existing?.id || stringValue(data.id, randomUUID()),
    setting_key: stringValue(data.key, existing?.setting_key || "main"),
    developer_name: stringValue(data.developer_name),
    developer_role: stringValue(data.developer_role),
    developer_bio: stringValue(data.developer_bio),
    developer_focus_json: stringifyJson(data.developer_focus, []),
    skill_categories_json: stringifyJson(data.skill_categories, []),
    social_links_json: stringifyJson(data.social_links, []),
    floating_technologies_json: stringifyJson(data.floating_technologies, []),
    created_date: existing?.created_date || stringValue(data.created_date, nowIso()),
    updated_date: stringValue(data.updated_date, nowIso()),
  };
}

export function getDatabase() {
  if (!database) {
    const databasePath = resolveDatabasePath();
    ensureDir(path.dirname(databasePath));
    database = new Database(databasePath);
    database.exec("PRAGMA foreign_keys = ON;");
    database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_date TEXT NOT NULL,
        updated_date TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        preview_image TEXT NOT NULL DEFAULT '',
        live_link TEXT NOT NULL DEFAULT '',
        github_link TEXT NOT NULL DEFAULT '',
        technologies_json TEXT NOT NULL DEFAULT '[]',
        featured INTEGER NOT NULL DEFAULT 0,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_date TEXT NOT NULL,
        updated_date TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ctfs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        platform TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        topic TEXT NOT NULL DEFAULT '',
        difficulty TEXT NOT NULL DEFAULT 'Medium',
        technologies_json TEXT NOT NULL DEFAULT '[]',
        image TEXT NOT NULL DEFAULT '',
        writeup_link TEXT NOT NULL DEFAULT '',
        completed_date TEXT NOT NULL DEFAULT '',
        order_index INTEGER NOT NULL DEFAULT 0,
        created_date TEXT NOT NULL,
        updated_date TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        provider TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        certificate_link TEXT NOT NULL DEFAULT '',
        certificate_pdf TEXT NOT NULL DEFAULT '',
        technologies_json TEXT NOT NULL DEFAULT '[]',
        months INTEGER NOT NULL DEFAULT 0,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_date TEXT NOT NULL,
        updated_date TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        id TEXT PRIMARY KEY,
        setting_key TEXT NOT NULL UNIQUE,
        developer_name TEXT NOT NULL DEFAULT '',
        developer_role TEXT NOT NULL DEFAULT '',
        developer_bio TEXT NOT NULL DEFAULT '',
        developer_focus_json TEXT NOT NULL DEFAULT '[]',
        skill_categories_json TEXT NOT NULL DEFAULT '[]',
        social_links_json TEXT NOT NULL DEFAULT '[]',
        floating_technologies_json TEXT NOT NULL DEFAULT '[]',
        created_date TEXT NOT NULL,
        updated_date TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        message TEXT NOT NULL DEFAULT '',
        recipient_email TEXT NOT NULL DEFAULT '',
        created_date TEXT NOT NULL
      );
    `);
  }

  return database;
}

export function getDatabasePath() {
  return resolveDatabasePath();
}

export function getContentCounts() {
  const db = getDatabase();

  return {
    projects: db.prepare("SELECT COUNT(*) AS count FROM projects").get().count,
    ctfs: db.prepare("SELECT COUNT(*) AS count FROM ctfs").get().count,
    courses: db.prepare("SELECT COUNT(*) AS count FROM courses").get().count,
    siteSettings: db.prepare("SELECT COUNT(*) AS count FROM site_settings").get().count,
  };
}

export function isContentEmpty() {
  const counts = getContentCounts();
  return Object.values(counts).every((count) => count === 0);
}

export function clearContentTables() {
  const db = getDatabase();
  db.exec(`
    DELETE FROM projects;
    DELETE FROM ctfs;
    DELETE FROM courses;
    DELETE FROM site_settings;
  `);
}

export function listProjects() {
  return getDatabase()
    .prepare("SELECT * FROM projects ORDER BY order_index ASC, updated_date DESC")
    .all()
    .map(mapProject);
}

export function getProjectById(id) {
  const row = getDatabase().prepare("SELECT * FROM projects WHERE id = ?").get(id);
  return row ? mapProject(row) : null;
}

export function createProject(data) {
  const record = prepareProject(data);
  insertRecord("projects", record);
  return getProjectById(record.id);
}

export function updateProject(id, data) {
  const existing = getDatabase().prepare("SELECT * FROM projects WHERE id = ?").get(id);
  if (!existing) {
    return null;
  }

  const record = prepareProject(
    {
      ...mapProject(existing),
      ...data,
      updated_date: nowIso(),
    },
    existing,
  );
  const { id: _ignoreId, ...updates } = record;
  updateRecord("projects", id, updates);
  return getProjectById(id);
}

export function deleteProject(id) {
  deleteRecord("projects", id);
}

export function listCtfs() {
  return getDatabase()
    .prepare("SELECT * FROM ctfs ORDER BY order_index ASC, updated_date DESC")
    .all()
    .map(mapCtf);
}

export function getCtfById(id) {
  const row = getDatabase().prepare("SELECT * FROM ctfs WHERE id = ?").get(id);
  return row ? mapCtf(row) : null;
}

export function createCtf(data) {
  const record = prepareCtf(data);
  insertRecord("ctfs", record);
  return getCtfById(record.id);
}

export function updateCtf(id, data) {
  const existing = getDatabase().prepare("SELECT * FROM ctfs WHERE id = ?").get(id);
  if (!existing) {
    return null;
  }

  const record = prepareCtf(
    {
      ...mapCtf(existing),
      ...data,
      updated_date: nowIso(),
    },
    existing,
  );
  const { id: _ignoreId, ...updates } = record;
  updateRecord("ctfs", id, updates);
  return getCtfById(id);
}

export function deleteCtf(id) {
  deleteRecord("ctfs", id);
}

export function listCourses() {
  return getDatabase()
    .prepare("SELECT * FROM courses ORDER BY order_index ASC, updated_date DESC")
    .all()
    .map(mapCourse);
}

export function getCourseById(id) {
  const row = getDatabase().prepare("SELECT * FROM courses WHERE id = ?").get(id);
  return row ? mapCourse(row) : null;
}

export function createCourse(data) {
  const record = prepareCourse(data);
  insertRecord("courses", record);
  return getCourseById(record.id);
}

export function updateCourse(id, data) {
  const existing = getDatabase().prepare("SELECT * FROM courses WHERE id = ?").get(id);
  if (!existing) {
    return null;
  }

  const record = prepareCourse(
    {
      ...mapCourse(existing),
      ...data,
      updated_date: nowIso(),
    },
    existing,
  );
  const { id: _ignoreId, ...updates } = record;
  updateRecord("courses", id, updates);
  return getCourseById(id);
}

export function deleteCourse(id) {
  deleteRecord("courses", id);
}

export function listSiteSettings(filters = {}) {
  const hasKeyFilter = typeof filters.key === "string" && filters.key.length > 0;
  const sql = hasKeyFilter
    ? "SELECT * FROM site_settings WHERE setting_key = ? ORDER BY updated_date DESC"
    : "SELECT * FROM site_settings ORDER BY updated_date DESC";
  const rows = hasKeyFilter
    ? getDatabase().prepare(sql).all(filters.key)
    : getDatabase().prepare(sql).all();

  return rows.map(mapSiteSettings);
}

export function getSiteSettingsById(id) {
  const row = getDatabase().prepare("SELECT * FROM site_settings WHERE id = ?").get(id);
  return row ? mapSiteSettings(row) : null;
}

export function createSiteSettings(data) {
  const record = prepareSiteSettings(data);
  insertRecord("site_settings", record);
  return getSiteSettingsById(record.id);
}

export function updateSiteSettings(id, data) {
  const existing = getDatabase().prepare("SELECT * FROM site_settings WHERE id = ?").get(id);
  if (!existing) {
    return null;
  }

  const record = prepareSiteSettings(
    {
      ...mapSiteSettings(existing),
      ...data,
      updated_date: nowIso(),
    },
    existing,
  );
  const { id: _ignoreId, ...updates } = record;
  updateRecord("site_settings", id, updates);
  return getSiteSettingsById(id);
}

export function deleteSiteSettings(id) {
  deleteRecord("site_settings", id);
}

export function createUser({ email, passwordHash }) {
  const timestamp = nowIso();
  const record = {
    id: randomUUID(),
    email: stringValue(email).toLowerCase(),
    password_hash: passwordHash,
    created_date: timestamp,
    updated_date: timestamp,
  };

  insertRecord("users", record);
  return mapUser(record);
}

export function findUserByEmail(email) {
  const row = getDatabase()
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(stringValue(email).toLowerCase());
  return mapUser(row);
}

export function getUserById(id) {
  const row = getDatabase().prepare("SELECT * FROM users WHERE id = ?").get(id);
  return mapUser(row);
}

export function createContactMessage({ name, email, message, recipientEmail }) {
  const record = {
    id: randomUUID(),
    name: stringValue(name),
    email: stringValue(email).toLowerCase(),
    message: stringValue(message),
    recipient_email: stringValue(recipientEmail),
    created_date: nowIso(),
  };

  insertRecord("contact_messages", record);
  return record;
}
