import express from "express";
import {
  addProvider,
  getAllProviders,
  getProviderById,
  updateProvider,
  deleteProvider,
} from "../controllers/providerController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin Only Routes
router.post("/add", verifyToken, verifyAdmin, addProvider);
router.get("/", verifyToken, verifyAdmin, getAllProviders);
router.get("/:id", verifyToken, verifyAdmin, getProviderById);
router.put("/update/:id", verifyToken, verifyAdmin, updateProvider);
router.delete("/delete/:id", verifyToken, verifyAdmin, deleteProvider);

export default router;
