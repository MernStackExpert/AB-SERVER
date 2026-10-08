import { getDb } from "../config/db.js";
import { ObjectId } from "mongodb";

const getAllServices = async (req, res) => {
  try {
    const db = getDb();
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sortBy,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { "title.en": { $regex: search, $options: "i" } },
        { "title.bn": { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === "price_asc") sortOption = { price: 1 };
    if (sortBy === "price_desc") sortOption = { price: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const total = await db.collection("services").countDocuments(query);
    const services = await db
      .collection("services")
      .find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .toArray();

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: services,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};

const getServiceById = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const service = await db
      .collection("services")
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: "providers",
            localField: "providers",
            foreignField: "_id",
            as: "providerDetails",
          },
        },
      ])
      .toArray();

    if (!service || service.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, data: service[0] });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};

const addDigitalService = async (req, res) => {
  try {
    const db = getDb();

    let providerIds = [];
    if (req.body.providers && Array.isArray(req.body.providers)) {
      providerIds = req.body.providers.map((id) => new ObjectId(id));
    }

    const serviceData = {
      title: req.body.title, 
      category: req.body.category,
      serviceType: req.body.serviceType,
      price: Number(req.body.price),
      description: req.body.description, 
      icon: req.body.icon,
      img: req.body.img,
      videoLink: req.body.videoLink,
      serialId: req.body.serialId,
      media: req.body.media || [],
      keyFeatures: req.body.keyFeatures || [],
      deliveryTime: req.body.deliveryTime,
      providers: providerIds,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("services").insertOne(serviceData);
    res
      .status(201)
      .json({
        success: true,
        message: "Digital Service added successfully",
        data: result,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error adding service",
        error: error.message,
      });
  }
};

const addAccountService = async (req, res) => {
  try {
    const db = getDb();

    let providerIds = [];
    if (req.body.providers && Array.isArray(req.body.providers)) {
      providerIds = req.body.providers.map((id) => new ObjectId(id));
    }

    const serviceData = {
      title: req.body.title, 
      category: req.body.category,
      serviceType: req.body.serviceType,
      price: Number(req.body.price),
      description: req.body.description, 
      media: req.body.media || [],
      img: req.body.img,
      keyFeatures: req.body.keyFeatures || [],
      followers: req.body.followers,
      isMonetized: req.body.isMonetized,
      accountLink: req.body.accountLink,
      chanelName: req.body.chanelName,
      videoLink: req.body.videoLink, 
      providers: providerIds, 
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("services").insertOne(serviceData);
    res
      .status(201)
      .json({
        success: true,
        message: "Account Service added successfully",
        data: result,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error adding service",
        error: error.message,
      });
  }
};

const updateService = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    if (updateData.providers && Array.isArray(updateData.providers)) {
      updateData.providers = updateData.providers.map(
        (providerId) => new ObjectId(providerId),
      );
    }

    const result = await db
      .collection("services")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0)
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });

    res
      .status(200)
      .json({ success: true, message: "Service updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating service",
        error: error.message,
      });
  }
};

const deleteService = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const result = await db
      .collection("services")
      .updateOne(
        { _id: new ObjectId(id) }, 
        { 
          $set: { 
            status: "deleted", 
            deletedAt: new Date() 
          } 
        }
      );

    if (result.matchedCount === 0)
      return res.status(404).json({ success: false, message: "Service not found" });

    res.status(200).json({ success: true, message: "Service moved to recycle bin" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting service", error: error.message });
  }
};

const permanentDeleteService = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const result = await db
      .collection("services")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, message: "Service permanently deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting service permanently", error: error.message });
  }
};

const restoreService = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const result = await db
      .collection("services")
      .updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: "active",
            updatedAt: new Date()
          },
          $unset: { deletedAt: "" }
        }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, message: "Service restored successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error restoring service", error: error.message });
  }
};

const emptyRecycleBin = async (req, res) => {
  try {
    const db = getDb();

    const result = await db
      .collection("services")
      .deleteMany({ status: "deleted" });

    res.status(200).json({ success: true, message: `Successfully deleted ${result.deletedCount} services from recycle bin` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error emptying recycle bin", error: error.message });
  }
};

export {
  getAllServices,
  getServiceById,
  addDigitalService,
  addAccountService,
  updateService,
  deleteService,
  permanentDeleteService,
  restoreService,
  emptyRecycleBin,
};