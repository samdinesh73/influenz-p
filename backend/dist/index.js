"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT ? Number(process.env.PORT) : 5000;
// Enable CORS middleware (allows port 3000 Next.js frontend calls)
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
app.use((0, cors_1.default)({
    origin: frontendUrl,
    credentials: true
}));
// Parse request bodies
app.use(express_1.default.json());
// Main Auth endpoints
app.use("/api/auth", authRoutes_1.default);
// Health check endpoint
app.get("/", (req, res) => {
    res.status(200).json({ status: "healthy", service: "influenz-backend" });
});
// Launch server
app.listen(port, "0.0.0.0", () => {
    console.log(`[Influenz Backend] Running on http://localhost:${port}`);
});
