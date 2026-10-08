import express from "express";
import {
  createAdminOrder,
  getAdminOrders,
  getAdminOrderStats,
  getAdminOrderById,
  updateAdminOrder,
  updateAdminOrderStatus,
  deleteAdminOrder,
} from "../controllers/adminOrderController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", verifyToken, verifyAdmin, createAdminOrder);
router.get("/", verifyToken, verifyAdmin, getAdminOrders);
router.get("/stats", verifyToken, verifyAdmin, getAdminOrderStats);
router.get("/:id", verifyToken, verifyAdmin, getAdminOrderById);
router.put("/update/:id", verifyToken, verifyAdmin, updateAdminOrder);
router.patch("/status/:id", verifyToken, verifyAdmin, updateAdminOrderStatus);
router.delete("/delete/:id", verifyToken, verifyAdmin, deleteAdminOrder);

export default router;
