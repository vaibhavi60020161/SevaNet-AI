import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./db.js";
import apiRoutes from "./api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// API Routes
app.use("/api", apiRoutes);

// --- VITE MIDDLEWARE SETUP ---
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  const distPath = path.join(process.cwd(), "client/dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(distPath, "index.html"), (err) => {
        if (err) {
          res.status(500).send("Error loading production build. Ensure 'npm run build' was run.");
        }
      });
    }
  });
} else {
  // Local development with Vite
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
    root: path.join(process.cwd(), "client"),
  });
  app.use(vite.middlewares);
}

async function startServer() {
  await connectDB();
  
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// listen() only called locally, never on Vercel
if (!process.env.VERCEL) {
  startServer();
}

export default app;
