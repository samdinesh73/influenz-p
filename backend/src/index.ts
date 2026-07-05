import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 5000;

// Enable CORS middleware (allows port 3000 Next.js frontend calls)
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(cors({
  origin: frontendUrl,
  credentials: true
}));

// Parse request bodies
app.use(express.json());

// Main Auth endpoints
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ status: "healthy", service: "influenz-backend" });
});

// Launch server
app.listen(port, "0.0.0.0", () => {
  console.log(`[Influenz Backend] Running on http://localhost:${port}`);
});
