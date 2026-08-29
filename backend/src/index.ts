import { app } from "./app.js";
import { testConnection } from "./db.js";
import { initRedis } from "./redis.js";

const port = process.env.PORT || 5001;

const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  testConnection();
  initRedis();
});

server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${port} is already in use. Try setting a different PORT, e.g., PORT=5002 npm run start:backend`);
  } else {
    console.error("❌ Server error:", err);
  }
});
