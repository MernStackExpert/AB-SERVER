import express from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settingsController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getSettings);
router.put("/update", verifyToken, verifyAdmin, updateSettings);

export default router;
