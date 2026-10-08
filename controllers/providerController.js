import { getDb } from "../config/db.js";
import { ObjectId } from "mongodb";

const addProvider = async (req, res) => {
  try {
    const db = getDb();
    const { name, category, value, price, service, whatsapp, phone, facebook, image } = req.body;

    if (!name || !whatsapp) {
      return res.status(400).json({ success: false, message: "Name and WhatsApp are required" });
    }

    const newProvider = {
      name,
      whatsapp,
      phone: phone || whatsapp,
      service,
      price,
      category,
      value,
      facebook: facebook || "",
      image: image || "",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("providers").insertOne(newProvider);

    res.status(201).json({
      success: true,
      message: "Provider added successfully",
      providerId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add provider",
      error: error.message,
    });
  }
};

const getAllProviders = async (req, res) => {
  try {
    const db = getDb();
    const { status, category, search } = req.query;

    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { whatsapp: { $regex: search, $options: "i" } },
      ];
    }

    const providers = await db
      .collection("providers")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch providers",
      error: error.message,
    });
  }
};

const getProviderById = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const provider = await db.collection("providers").findOne({ _id: new ObjectId(id) });
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    res.status(200).json({ success: true, data: provider });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch provider details",
      error: error.message,
    });
  }
};

const updateProvider = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;

    const result = await db
      .collection("providers")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    res.status(200).json({ success: true, message: "Provider updated successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update provider",
      error: error.message,
    });
  }
};

const deleteProvider = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const result = await db.collection("providers").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    res.status(200).json({ success: true, message: "Provider deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete provider",
      error: error.message,
    });
  }
};

export {
  addProvider,
  getAllProviders,
  getProviderById,
  updateProvider,
  deleteProvider,
};