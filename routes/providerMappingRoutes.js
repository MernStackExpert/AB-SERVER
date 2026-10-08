import express from "express";
import {
  addMapping,
  getMappingsByService,
  getMappingCounts,
  updateMapping,
  deleteMapping,
} from "../controllers/providerMappingController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", verifyToken, verifyAdmin, addMapping);
router.get("/counts", verifyToken, verifyAdmin, getMappingCounts);
router.get("/:serviceId", verifyToken, verifyAdmin, getMappingsByService);
router.put("/update/:id", verifyToken, verifyAdmin, updateMapping);
router.delete("/delete/:id", verifyToken, verifyAdmin, deleteMapping);

export default router;