import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", createOrder);

router.get("/", verifyToken, verifyAdmin, getAllOrders);
router.get("/:id", verifyToken, verifyAdmin, getOrderById);
router.put("/update/:id", verifyToken, verifyAdmin, updateOrderStatus);
router.delete("/delete/:id", verifyToken, verifyAdmin, deleteOrder);

export default router;
