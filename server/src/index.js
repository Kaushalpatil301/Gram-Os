import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config({
  path: "./.env",
});

console.log("🔑 Environment variables loaded");
console.log("Cloudinary Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);

const port = process.env.PORT || 8000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

connectDB()
  .then(() => {
    httpServer.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  });
