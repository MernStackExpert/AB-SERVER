import express from "express";
import {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

router.post("/add", verifyToken, verifyAdmin, addCategory);
router.put("/update/:id", verifyToken, verifyAdmin, updateCategory);
router.delete("/delete/:id", verifyToken, verifyAdmin, deleteCategory);

export default router;
