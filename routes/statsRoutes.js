import express from "express";
import { getDashboardStats } from "../controllers/statsController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin Only Route
router.get("/dashboard", verifyToken, verifyAdmin, getDashboardStats);

export default router;
