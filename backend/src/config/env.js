import dotenv from "dotenv";

dotenv.config();

export const env = {
  // ----------------------------------------------------
  // SERVER
  // ----------------------------------------------------
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT || 5000),

  HOST: process.env.HOST || "0.0.0.0",

  // ----------------------------------------------------
  // DATABASE
  // ----------------------------------------------------
  DATABASE_URL: process.env.DATABASE_URL || "",

  DB_HOST: process.env.DB_HOST || "localhost",

  DB_PORT: Number(process.env.DB_PORT || 5432),

  DB_NAME: process.env.DB_NAME || "c_cube",

  DB_USER: process.env.DB_USER || "postgres",

  DB_PASSWORD: process.env.DB_PASSWORD || "",

  // PostgreSQL connection pool
  DB_POOL_MAX: Number(process.env.DB_POOL_MAX || 20),

  DB_POOL_MIN: Number(process.env.DB_POOL_MIN || 2),

  DB_IDLE_TIMEOUT_MS: Number(
    process.env.DB_IDLE_TIMEOUT_MS || 30000
  ),

  DB_CONNECTION_TIMEOUT_MS: Number(
    process.env.DB_CONNECTION_TIMEOUT_MS || 10000
  ),

  // ----------------------------------------------------
  // JWT
  // ----------------------------------------------------
  JWT_SECRET:
    process.env.JWT_SECRET ||
    "change-this-secret-in-production",

  JWT_EXPIRES_IN:
    process.env.JWT_EXPIRES_IN || "7d",

  // ----------------------------------------------------
  // CORS
  // ----------------------------------------------------
  FRONTEND_URL:
    process.env.FRONTEND_URL ||
    "http://localhost:5173",

  // ----------------------------------------------------
  // RATE LIMITING
  // ----------------------------------------------------
  RATE_LIMIT_WINDOW_MS: Number(
    process.env.RATE_LIMIT_WINDOW_MS || 60000
  ),

  RATE_LIMIT_MAX: Number(
    process.env.RATE_LIMIT_MAX || 20000
  ),

  // ----------------------------------------------------
  // CLUSTER / WORKERS
  // ----------------------------------------------------
  CLUSTER_WORKERS: Number(
    process.env.CLUSTER_WORKERS || 1
  ),

  // ----------------------------------------------------
  // TEST SETTINGS
  // ----------------------------------------------------
  DEFAULT_TEST_DURATION_SECONDS: Number(
    process.env.DEFAULT_TEST_DURATION_SECONDS || 1800
  ),

  // ----------------------------------------------------
  // LOGGING
  // ----------------------------------------------------
  LOG_LEVEL:
    process.env.LOG_LEVEL || "info",

  // ----------------------------------------------------
  // ADMIN
  // ----------------------------------------------------
  ADMIN_EMAIL:
    process.env.ADMIN_EMAIL || "",

  ADMIN_PASSWORD:
    process.env.ADMIN_PASSWORD || "",
};