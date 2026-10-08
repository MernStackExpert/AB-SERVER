import { getDb } from "../config/db.js";
import { ObjectId } from "mongodb";

const addInternalService = async (req, res) => {
  try {
    const db = getDb();
    const { title, img } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });
    }

    const newService = {
      title,
      img: img || "",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("internal_services")
      .insertOne(newService);

    res.status(201).json({
      success: true,
      message: "Internal service added successfully",
      serviceId: result.insertedId,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to add service",
        error: error.message,
      });
  }
};

const getAllInternalServices = async (req, res) => {
  try {
    const db = getDb();
    const services = await db
      .collection("internal_services")
      .find({ status: { $ne: "deleted" } })
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch services",
        error: error.message,
      });
  }
};

const updateInternalService = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    const result = await db
      .collection("internal_services")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Service updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update service",
        error: error.message,
      });
  }
};

const deleteInternalService = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const result = await db
      .collection("internal_services")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount > 0) {
      await db
        .collection("provider_mappings")
        .deleteMany({ serviceId: new ObjectId(id) });
    }

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete service",
        error: error.message,
      });
  }
};

export {
  addInternalService,
  getAllInternalServices,
  updateInternalService,
  deleteInternalService,
};
