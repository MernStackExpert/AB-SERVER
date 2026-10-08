import express from "express";
import {
  addInternalService,
  getAllInternalServices,
  updateInternalService,
  deleteInternalService,
} from "../controllers/internalServiceController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", verifyToken, verifyAdmin, addInternalService);
router.get("/", verifyToken, verifyAdmin, getAllInternalServices);
router.put("/update/:id", verifyToken, verifyAdmin, updateInternalService);
router.delete("/delete/:id", verifyToken, verifyAdmin, deleteInternalService);

export default router;
