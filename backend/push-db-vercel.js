import fs from "fs";
import { execSync } from "child_process";
const env = fs.readFileSync(".env", "utf8");
const dbUrl = env.match(/^DATABASE_URL=(.*)$/m)?.[1];
if (dbUrl) {
  try {
    execSync("npx vercel env rm DATABASE_URL production -y", { stdio: "ignore" });
  } catch(e) {}
  execSync(`echo "${dbUrl}" | npx vercel env add DATABASE_URL production`, { stdio: "inherit" });
  console.log("✅ DATABASE_URL pushed to Vercel Production!");
}
