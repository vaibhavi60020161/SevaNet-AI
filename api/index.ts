import express from "express";
import path from "path";
import apiRoutes from "../server/api.js";

const app = express();
app.use(express.json());

// API Routes
app.use("/api", apiRoutes);

// In Vercel, serve static files from client/dist
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

export default app;
