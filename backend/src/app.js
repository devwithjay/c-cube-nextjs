import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import { initializeDatabase } from "./db/schema.js";
import { seedDatabase } from "./db/seed.js";

import adminSectionRoutes from "./module/admin/admin.section.routes.js";
import adminQuestionRoutes from "./module/admin/admin.question.routes.js";
import threeQRoutes from "./module/threeQ/threeQ.routes.js";
import clubRoutes from "./module/club/club.routes.js";
import eventRoutes from "./module/events/events.routes.js";
import teamRoutes from "./module/team/team.routes.js";
import galleryRoutes from "./module/gallery/gallery.routes.js";
import contactRoutes from "./module/contact/contact.routes.js";
import adminAuthRoutes from "./module/admin/admin.auth.routes.js";
import adminTestRoutes from "./module/admin/admin.test.routes.js";

/*
|--------------------------------------------------------------------------
| ONE-TIME INITIALIZATION
|--------------------------------------------------------------------------
*/

let initialized = false;

export async function initializeApp() {
  if (initialized) return;

  console.log("🔄 Initializing database (serverless)...");
  await initializeDatabase();
  console.log("✅ Database schema initialized.");

  await seedDatabase();
  console.log("✅ Database seed completed.");

  initialized = true;
}

/*
|--------------------------------------------------------------------------
| CREATE EXPRESS APP
|--------------------------------------------------------------------------
*/

export function createApp() {
  const app = express();

  /*
  |--------------------------------------------------------------------------
  | TRUST PROXY (Vercel sits behind a proxy)
  |--------------------------------------------------------------------------
  */

  app.set("trust proxy", 1);

  /*
  |--------------------------------------------------------------------------
  | SECURITY
  |--------------------------------------------------------------------------
  */

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );

  /*
  |--------------------------------------------------------------------------
  | COMPRESSION
  |--------------------------------------------------------------------------
  */

  app.use(
    compression({
      threshold: 1024,
    })
  );

  /*
  |--------------------------------------------------------------------------
  | RATE LIMIT
  |--------------------------------------------------------------------------
  */

  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) =>
        req.path === "/api/health" ||
        req.path === "/api",
      message: {
        success: false,
        message: "Too many requests. Please try again later.",
      },
    })
  );

  /*
  |--------------------------------------------------------------------------
  | CORS
  |--------------------------------------------------------------------------
  */

  app.use(
    cors({
      origin(origin, callback) {
        const isNoOrigin = !origin;

        const isLocalDevelopmentOrigin =
          /^https?:\/\/localhost:\d+$/.test(origin || "");

        const isConfiguredFrontend =
          origin === env.FRONTEND_URL;

        const isVercelPreview =
          /\.vercel\.app$/.test(origin || "");

        if (
          isNoOrigin ||
          isLocalDevelopmentOrigin ||
          isConfiguredFrontend ||
          isVercelPreview
        ) {
          return callback(null, true);
        }

        return callback(
          new Error("Origin is not allowed by CORS.")
        );
      },
    })
  );

  /*
  |--------------------------------------------------------------------------
  | JSON & URL-ENCODED BODY
  |--------------------------------------------------------------------------
  */

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  /*
  |--------------------------------------------------------------------------
  | HEALTH CHECK
  |--------------------------------------------------------------------------
  */

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "c-cube-backend",
      runtime: "serverless",
      timestamp: new Date().toISOString(),
    });
  });

  /*
  |--------------------------------------------------------------------------
  | API ROOT
  |--------------------------------------------------------------------------
  */

  app.get("/api", (req, res) => {
    res.status(200).json({
      success: true,
      name: "C Cube API",
      version: "1.0.0",
      message: "C Cube Club Backend API is running.",
    });
  });

  /*
  |--------------------------------------------------------------------------
  | ROUTES
  |--------------------------------------------------------------------------
  */

  app.use("/api/3q", threeQRoutes);
  app.use("/api/club", clubRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api/team", teamRoutes);
  app.use("/api/gallery", galleryRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/admin/auth", adminAuthRoutes);
  app.use("/api/admin/tests", adminTestRoutes);
  app.use("/api/admin/tests", adminSectionRoutes);
  app.use("/api/admin/sections", adminQuestionRoutes);
  app.use("/api/admin/questions", adminQuestionRoutes);

  /*
  |--------------------------------------------------------------------------
  | ERROR HANDLER
  |--------------------------------------------------------------------------
  */

  app.use((error, req, res, next) => {
    console.error("Server Error:", error);

    res
      .status(error.statusCode || 500)
      .json({
        success: false,
        message: error.statusCode
          ? error.message
          : "Internal server error",
      });
  });

  return app;
}
