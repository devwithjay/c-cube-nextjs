import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cluster from "node:cluster";
import os from "node:os";

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
| ENVIRONMENT
|--------------------------------------------------------------------------
*/

const isProductionMode =
  env.NODE_ENV === "production";

/*
|--------------------------------------------------------------------------
| CLUSTER
|--------------------------------------------------------------------------
*/

const workerCount = isProductionMode
  ? Math.min(
    env.CLUSTER_WORKERS,
    os.availableParallelism?.() ?? env.CLUSTER_WORKERS
  )
  : 1;

/*
|--------------------------------------------------------------------------
| DATABASE INITIALIZATION
|--------------------------------------------------------------------------
*/

async function initializeRuntime() {
  console.log("🔄 Initializing database...");

  await initializeDatabase();

  console.log("✅ Database schema initialized.");

  await seedDatabase();

  console.log("✅ Database seed completed.");
}

/*
|--------------------------------------------------------------------------
| CREATE EXPRESS APP
|--------------------------------------------------------------------------
*/

function createApp() {
  const app = express();

  /*
  |--------------------------------------------------------------------------
  | TRUST PROXY
  |--------------------------------------------------------------------------
  */

  if (env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

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
        message:
          "Too many requests. Please try again later.",
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
        /*
        |--------------------------------------------------------------------------
        | Allow requests without Origin
        | Useful for Postman, server-to-server requests, etc.
        |--------------------------------------------------------------------------
        */

        const isNoOrigin = !origin;

        /*
        |--------------------------------------------------------------------------
        | Allow localhost during development
        |--------------------------------------------------------------------------
        */

        const isLocalDevelopmentOrigin =
          /^https?:\/\/localhost:\d+$/.test(
            origin || ""
          );

        /*
        |--------------------------------------------------------------------------
        | Allow configured frontend
        |--------------------------------------------------------------------------
        */

        const isConfiguredFrontend =
          origin === env.FRONTEND_URL;

        const isVercelOrigin =
          origin && origin.endsWith(".vercel.app");

        if (
          isNoOrigin ||
          isLocalDevelopmentOrigin ||
          isConfiguredFrontend ||
          isVercelOrigin
        ) {
          return callback(null, true);
        }

        return callback(
          new Error(
            "Origin is not allowed by CORS."
          )
        );
      },
    })
  );

  /*
  |--------------------------------------------------------------------------
  | JSON & URL-ENCODED BODY
  |--------------------------------------------------------------------------
  | 10MB limit supports question/image URL payloads.
  |--------------------------------------------------------------------------
  */

  app.use(
    express.json({
      limit: "10mb",
    })
  );

  app.use(
    express.urlencoded({
      extended: true,
      limit: "10mb",
    })
  );

  /*
  |--------------------------------------------------------------------------
  | HEALTH CHECK
  |--------------------------------------------------------------------------
  */

  app.get(
    "/api/health",
    (req, res) => {
      res.json({
        status: "ok",

        service:
          "c-cube-backend",

        timestamp:
          new Date().toISOString(),

        pid: process.pid,
      });
    }
  );

  /*
  |--------------------------------------------------------------------------
  | API ROOT
  |--------------------------------------------------------------------------
  */

  app.get(
    "/api",
    (req, res) => {
      res.status(200).json({
        success: true,

        name:
          "C Cube API",

        version:
          "1.0.0",

        message:
          "C Cube Club Backend API is running.",

        endpoints: {
          health:
            "/api/health",

          club:
            "/api/club",

          events:
            "/api/events",

          team:
            "/api/team",

          gallery:
            "/api/gallery",

          contact:
            "/api/contact",

          threeQ:
            "/api/3q",

          adminAuth:
            "/api/admin/auth",
        },
      });
    }
  );

  /*
  |--------------------------------------------------------------------------
  | ROOT
  |--------------------------------------------------------------------------
  */

  app.get(
    "/",
    (req, res) => {
      res.json({
        message:
          "C Cube Backend API",
      });
    }
  );

  /*
  |--------------------------------------------------------------------------
  | 3Q ROUTES
  |--------------------------------------------------------------------------
  */

  app.use(
    "/api/3q",
    threeQRoutes
  );

  /*
  |--------------------------------------------------------------------------
  | CLUB ROUTES
  |--------------------------------------------------------------------------
  */

  app.use(
    "/api/club",
    clubRoutes
  );

  /*
  |--------------------------------------------------------------------------
  | EVENT ROUTES
  |--------------------------------------------------------------------------
  */

  app.use(
    "/api/events",
    eventRoutes
  );

  /*
  |--------------------------------------------------------------------------
  | TEAM ROUTES
  |--------------------------------------------------------------------------
  */

  app.use(
    "/api/team",
    teamRoutes
  );

  /*
  |--------------------------------------------------------------------------
  | GALLERY ROUTES
  |--------------------------------------------------------------------------
  */

  app.use(
    "/api/gallery",
    galleryRoutes
  );

  /*
  |--------------------------------------------------------------------------
  | CONTACT ROUTES
  |--------------------------------------------------------------------------
  */

  app.use(
    "/api/contact",
    contactRoutes
  );

  /*
  |--------------------------------------------------------------------------
  | ADMIN AUTH
  |--------------------------------------------------------------------------
  */

  app.use(
    "/api/admin/auth",
    adminAuthRoutes
  );

  /*
  |--------------------------------------------------------------------------
  | ADMIN TESTS
  |--------------------------------------------------------------------------
  */

  app.use(
    "/api/admin/tests",
    adminTestRoutes
  );

  /*
  |--------------------------------------------------------------------------
  | ADMIN SECTIONS
  |--------------------------------------------------------------------------
  */

  app.use(
    "/api/admin/tests",
    adminSectionRoutes
  );

  /*
  |--------------------------------------------------------------------------
  | ADMIN QUESTIONS
  |--------------------------------------------------------------------------
  */

  app.use(
    "/api/admin/sections",
    adminQuestionRoutes
  );

  app.use(
    "/api/admin/questions",
    adminQuestionRoutes
  );

  /*
  |--------------------------------------------------------------------------
  | ERROR HANDLER
  |--------------------------------------------------------------------------
  */

  app.use(
    (
      error,
      req,
      res,
      next
    ) => {
      console.error(
        "Server Error:",
        error
      );

      res
        .status(
          error.statusCode || 500
        )
        .json({
          success: false,

          message:
            error.statusCode
              ? error.message
              : "Internal server error",
        });
    }
  );

  return app;
}

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

async function startServer() {
  try {
    const app = createApp();

    const server = app.listen(
      env.PORT,
      env.HOST,
      () => {
        console.log(
          `Server running at http://${env.HOST === "0.0.0.0" ? "localhost" : env.HOST}:${env.PORT} using pid ${process.pid}`
        );
      }
    );

    /*
    |--------------------------------------------------------------------------
    | HIGH CONCURRENCY SETTINGS
    |--------------------------------------------------------------------------
    */

    server.keepAliveTimeout =
      Number(
        process.env.KEEP_ALIVE_TIMEOUT || 65000
      );

    server.headersTimeout =
      Number(
        process.env.HEADERS_TIMEOUT || 66000
      );

    server.requestTimeout =
      Number(
        process.env.REQUEST_TIMEOUT || 30000
      );

    /*
    |--------------------------------------------------------------------------
    | Maximum number of simultaneous sockets
    |--------------------------------------------------------------------------
    */

    server.maxConnections = 10000;
  } catch (error) {
    console.error(
      "Server startup failed:",
      error
    );

    process.exit(1);
  }
}

/*
|--------------------------------------------------------------------------
| BOOT
|--------------------------------------------------------------------------
*/

async function boot() {
  /*
  |--------------------------------------------------------------------------
  | PRODUCTION
  |--------------------------------------------------------------------------
  |
  | Primary process:
  |   1. Initialize database
  |   2. Seed database
  |   3. Start workers
  |
  | Worker processes:
  |   Start server only.
  |
  |--------------------------------------------------------------------------
  */

  if (isProductionMode) {
    if (cluster.isPrimary) {
      console.log(
        `Starting cluster with ${workerCount} workers`
      );

      /*
      |--------------------------------------------------------------------------
      | Initialize database only once
      |--------------------------------------------------------------------------
      */

      await initializeRuntime();

      /*
      |--------------------------------------------------------------------------
      | Start workers
      |--------------------------------------------------------------------------
      */

      for (
        let index = 0;
        index < workerCount;
        index += 1
      ) {
        cluster.fork();
      }

      /*
      |--------------------------------------------------------------------------
      | Restart crashed workers
      |--------------------------------------------------------------------------
      */

      cluster.on(
        "exit",
        (
          worker,
          code,
          signal
        ) => {
          console.warn(
            `Worker ${worker.process.pid} exited. Restarting...`
          );

          cluster.fork();
        }
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | PRODUCTION WORKER
    |--------------------------------------------------------------------------
    */

    await startServer();

    return;
  }

  /*
  |--------------------------------------------------------------------------
  | DEVELOPMENT
  |--------------------------------------------------------------------------
  */

  console.log(
    "🛠️ Development mode detected."
  );

  await initializeRuntime();

  await startServer();
}

/*
|--------------------------------------------------------------------------
| RUN
|--------------------------------------------------------------------------
*/

boot().catch(
  (error) => {
    console.error(
      "Boot failed:",
      error
    );

    process.exit(1);
  }
);