import { initializeApp } from "./src/app.js";

async function main() {
  console.log("🚀 Starting remote database initialization...");
  try {
    await initializeApp();
    console.log("🎉 Database initialization and seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Initialization failed:", error);
    process.exit(1);
  }
}

main();
