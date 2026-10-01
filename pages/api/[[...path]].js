import { createApp, initializeApp } from "../../backend/src/app.js";

/*
|--------------------------------------------------------------------------
| SERVERLESS HANDLER — Wraps Express for Vercel
|--------------------------------------------------------------------------
|
| This catch-all Pages API route pipes every /api/* request through
| the existing Express application. The Express router, middleware
| (CORS, helmet, rate-limit, compression), and error handler all
| work exactly as they did in the standalone server.
|
| Body parsing is disabled on the Next.js side so Express's own
| express.json() middleware handles it instead.
|
|--------------------------------------------------------------------------
*/

let app;

export default async function handler(req, res) {
  if (!app) {
    await initializeApp();
    app = createApp();
  }

  return app(req, res);
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
