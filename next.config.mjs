/** @type {import('next').NextConfig} */
const nextConfig = {
  /*
  |--------------------------------------------------------------------------
  | Server-side packages that should NOT be bundled client-side
  |--------------------------------------------------------------------------
  */
  serverExternalPackages: [
    "pg",
    "bcryptjs",
    "jsonwebtoken",
    "express",
    "helmet",
    "compression",
    "express-rate-limit",
    "cors",
    "dotenv",
    "zod",
  ],
};

export default nextConfig;
