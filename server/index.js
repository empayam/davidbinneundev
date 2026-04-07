import process from "node:process";

try {
  process.loadEnvFile?.();
} catch (error) {
  if (error?.code !== "ENOENT") {
    throw error;
  }
}

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import {
  createContactMessage,
  createCourse,
  createCtf,
  createProject,
  createSiteSettings,
  createUser,
  deleteCourse,
  deleteCtf,
  deleteProject,
  findUserByEmail,
  getCourseById,
  getCtfById,
  getDatabase,
  getDatabasePath,
  getProjectById,
  getUserById,
  isContentEmpty,
  listCourses,
  listCtfs,
  listProjects,
  listSiteSettings,
  updateCourse,
  updateCtf,
  updateProject,
  updateSiteSettings,
} from "./database.js";
import { hashPassword, readSessionToken, SESSION_COOKIE_NAME, verifyPassword, verifySessionToken, createSessionToken } from "./auth.js";
import { importBase44Exports, resolveExportDirectory } from "./importBase44.js";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(serverDir, "..");
const uploadsDir = process.env.UPLOADS_DIR || path.join(appRoot, "uploads");
const publicBaseUrl = process.env.PUBLIC_BASE_URL || "";
const port = Number(process.env.PORT || 3001);

mkdirSync(uploadsDir, { recursive: true });
getDatabase();

if (isContentEmpty()) {
  const seedResult = importBase44Exports();
  if (seedResult.imported) {
    console.log(`Imported Base44 export from ${seedResult.exportDir}`);
  } else if (resolveExportDirectory()) {
    console.warn("Database is empty, but the Base44 export could not be imported.");
  }
}

function toPublicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: "admin",
  };
}

function currentUserFromRequest(req) {
  const token = readSessionToken(req.headers.cookie || "");
  const payload = verifySessionToken(token);
  if (!payload?.sub) {
    return null;
  }

  return getUserById(payload.sub);
}

function requireAuth(req, res, next) {
  const user = currentUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  req.user = toPublicUser(user);
  next();
}

function validationError(res, message, status = 400) {
  res.status(status).json({ error: message });
}

function uploadUrlFor(filename) {
  const relativePath = `/uploads/${filename}`;
  return publicBaseUrl ? `${publicBaseUrl.replace(/\/$/, "")}${relativePath}` : relativePath;
}

function extractContactFields(body) {
  const match = String(body).match(/^Name:\s*(.*)\nEmail:\s*(.*)\n\nMessage:\n([\s\S]*)$/);
  if (!match) {
    return {
      name: "",
      email: "",
      message: body,
    };
  }

  return {
    name: match[1].trim(),
    email: match[2].trim(),
    message: match[3].trim(),
  };
}

async function sendMail({ to, subject, body }) {
  const smtpUrl = process.env.SMTP_URL;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const emailFrom = process.env.EMAIL_FROM || smtpUser || "noreply@example.com";

  if (!smtpUrl && (!smtpHost || !smtpUser || !smtpPass)) {
    return { delivered: false };
  }

  const transporter = smtpUrl
    ? nodemailer.createTransport(smtpUrl)
    : nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

  await transporter.sendMail({
    from: emailFrom,
    to,
    subject,
    text: body,
  });

  return { delivered: true };
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadsDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    callback(null, `${randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    databasePath: getDatabasePath(),
  });
});

app.get("/api/auth/me", (req, res) => {
  const user = currentUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.json(toPublicUser(user));
});

app.post("/api/auth/register", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !email.includes("@")) {
    validationError(res, "Please provide a valid email address.");
    return;
  }

  if (password.length < 8) {
    validationError(res, "Password must be at least 8 characters long.");
    return;
  }

  if (findUserByEmail(email)) {
    validationError(res, "A user with that email already exists.", 409);
    return;
  }

  const user = createUser({
    email,
    passwordHash: hashPassword(password),
  });

  const token = createSessionToken({ sub: user.id, email: user.email });
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 30,
    path: "/",
  });

  res.status(201).json(toPublicUser(user));
});

app.post("/api/auth/login", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const user = findUserByEmail(email);

  if (!user || !verifyPassword(password, user.password_hash)) {
    validationError(res, "Invalid email or password.", 401);
    return;
  }

  const token = createSessionToken({ sub: user.id, email: user.email });
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 30,
    path: "/",
  });

  res.json(toPublicUser(user));
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  res.status(204).end();
});

app.get("/api/projects", (_req, res) => {
  res.json(listProjects());
});

app.post("/api/projects", requireAuth, (req, res) => {
  if (!req.body.title) {
    validationError(res, "Project title is required.");
    return;
  }

  res.status(201).json(createProject(req.body));
});

app.put("/api/projects/:id", requireAuth, (req, res) => {
  const project = updateProject(req.params.id, req.body);
  if (!project) {
    validationError(res, "Project not found.", 404);
    return;
  }

  res.json(project);
});

app.delete("/api/projects/:id", requireAuth, (req, res) => {
  if (!getProjectById(req.params.id)) {
    validationError(res, "Project not found.", 404);
    return;
  }

  deleteProject(req.params.id);
  res.status(204).end();
});

app.get("/api/ctfs", (_req, res) => {
  res.json(listCtfs());
});

app.post("/api/ctfs", requireAuth, (req, res) => {
  if (!req.body.title) {
    validationError(res, "CTF title is required.");
    return;
  }

  res.status(201).json(createCtf(req.body));
});

app.put("/api/ctfs/:id", requireAuth, (req, res) => {
  const ctf = updateCtf(req.params.id, req.body);
  if (!ctf) {
    validationError(res, "CTF not found.", 404);
    return;
  }

  res.json(ctf);
});

app.delete("/api/ctfs/:id", requireAuth, (req, res) => {
  if (!getCtfById(req.params.id)) {
    validationError(res, "CTF not found.", 404);
    return;
  }

  deleteCtf(req.params.id);
  res.status(204).end();
});

app.get("/api/courses", (_req, res) => {
  res.json(listCourses());
});

app.post("/api/courses", requireAuth, (req, res) => {
  if (!req.body.title) {
    validationError(res, "Course title is required.");
    return;
  }

  res.status(201).json(createCourse(req.body));
});

app.put("/api/courses/:id", requireAuth, (req, res) => {
  const course = updateCourse(req.params.id, req.body);
  if (!course) {
    validationError(res, "Course not found.", 404);
    return;
  }

  res.json(course);
});

app.delete("/api/courses/:id", requireAuth, (req, res) => {
  if (!getCourseById(req.params.id)) {
    validationError(res, "Course not found.", 404);
    return;
  }

  deleteCourse(req.params.id);
  res.status(204).end();
});

app.get("/api/site-settings", (req, res) => {
  res.json(listSiteSettings(req.query));
});

app.post("/api/site-settings", requireAuth, (req, res) => {
  res.status(201).json(createSiteSettings(req.body));
});

app.put("/api/site-settings/:id", requireAuth, (req, res) => {
  const siteSettings = updateSiteSettings(req.params.id, req.body);
  if (!siteSettings) {
    validationError(res, "Site settings not found.", 404);
    return;
  }

  res.json(siteSettings);
});

app.post("/api/uploads", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) {
    validationError(res, "A file is required.");
    return;
  }

  res.status(201).json({
    file_url: uploadUrlFor(req.file.filename),
  });
});

app.post("/api/integrations/send-email", async (req, res) => {
  const to = String(req.body.to || "").trim();
  const subject = String(req.body.subject || "").trim();
  const body = String(req.body.body || "").trim();

  if (!to || !subject || !body) {
    validationError(res, "Missing email payload.");
    return;
  }

  const { name, email, message } = extractContactFields(body);
  createContactMessage({
    name,
    email,
    message,
    recipientEmail: to,
  });

  try {
    const result = await sendMail({ to, subject, body });
    res.json({
      ok: true,
      delivered: result.delivered,
    });
  } catch (error) {
    console.error("Email delivery failed:", error);
    res.status(500).json({ error: "Unable to send email." });
  }
});

if (process.env.NODE_ENV === "production") {
  const distDir = path.join(appRoot, "dist");
  if (existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get(/^(?!\/api\/|\/uploads\/).*/, (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }
}

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
