import express from "express";
import {
  getAllServices,
  getServiceById,
  addDigitalService,
  addAccountService,
  updateService,
  deleteService,
  permanentDeleteService,
  restoreService,
  emptyRecycleBin,
} from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", getAllServices);
router.get("/:id", getServiceById);
router.post("/add/digital", addDigitalService);
router.post("/add/account", addAccountService);
router.put("/update/:id", updateService);
router.delete("/delete/:id", deleteService);
router.delete("/permanent-delete/:id", permanentDeleteService);
router.put("/restore/:id", restoreService);
router.delete("/empty-recycle-bin", emptyRecycleBin);

export default router;