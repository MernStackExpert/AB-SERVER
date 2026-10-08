import { getDb } from "../config/db.js";
import { ObjectId } from "mongodb";

const addMapping = async (req, res) => {
  try {
    const db = getDb();
    const { serviceId, providerId, price } = req.body;

    if (!serviceId || !providerId || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Service ID, Provider ID, and Price are required",
      });
    }

    const existingMapping = await db.collection("provider_mappings").findOne({
      serviceId: new ObjectId(serviceId),
      providerId: new ObjectId(providerId),
    });

    if (existingMapping) {
      return res.status(400).json({
        success: false,
        message: "Provider is already mapped to this service",
      });
    }

    const newMapping = {
      serviceId: new ObjectId(serviceId),
      providerId: new ObjectId(providerId),
      price: Number(price),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("provider_mappings").insertOne(newMapping);

    res.status(201).json({
      success: true,
      message: "Provider mapped successfully",
      mappingId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to map provider",
      error: error.message,
    });
  }
};

const getMappingsByService = async (req, res) => {
  try {
    const db = getDb();
    const { serviceId } = req.params;

    const mappings = await db.collection("provider_mappings").aggregate([
      { $match: { serviceId: new ObjectId(serviceId) } },
      {
        $lookup: {
          from: "providers",
          localField: "providerId",
          foreignField: "_id",
          as: "providerInfo",
        },
      },
      { $unwind: "$providerInfo" },
      {
        $project: {
          _id: 1,
          price: 1,
          "providerInfo._id": 1,
          "providerInfo.name": 1,
          "providerInfo.image": 1,
          "providerInfo.whatsapp": 1,
          "providerInfo.facebook": 1,
          createdAt: 1,
        },
      },
    ]).toArray();

    res.status(200).json({ success: true, data: mappings });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch mappings",
      error: error.message,
    });
  }
};

const getMappingCounts = async (req, res) => {
  try {
    const db = getDb();
    const counts = await db.collection("provider_mappings").aggregate([
      { $group: { _id: "$serviceId", count: { $sum: 1 } } }
    ]).toArray();

    res.status(200).json({ success: true, data: counts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch mapping counts",
      error: error.message,
    });
  }
};

const updateMapping = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { price } = req.body;

    const result = await db.collection("provider_mappings").updateOne(
      { _id: new ObjectId(id) },
      { $set: { price: Number(price), updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Mapping not found" });
    }

    res.status(200).json({ success: true, message: "Provider price updated successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update price",
      error: error.message,
    });
  }
};

const deleteMapping = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const result = await db.collection("provider_mappings").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Mapping not found" });
    }

    res.status(200).json({ success: true, message: "Provider removed from service" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove provider",
      error: error.message,
    });
  }
};

export {
  addMapping,
  getMappingsByService,
  getMappingCounts,
  updateMapping,
  deleteMapping,
};