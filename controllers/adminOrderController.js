import { getDb } from "../config/db.js";
import { ObjectId } from "mongodb";

const createAdminOrder = async (req, res) => {
  try {
    const db = getDb();
    const {
      customerName,
      whatsapp,
      facebook,
      targetLink,
      orderNotes,
      serviceId,
      providerId,
      sellingPrice,
      providerCost,
      deliveryTime,
      status,
    } = req.body;

    if (!customerName || sellingPrice === undefined) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Customer name and selling price are required",
        });
    }

    const price = Number(sellingPrice) || 0;
    const cost = Number(providerCost) || 0;
    const netProfit = price - cost;

    const newOrder = {
      customerName,
      whatsapp: whatsapp || "",
      facebook: facebook || "",
      targetLink: targetLink || "",
      orderNotes: orderNotes || "",
      serviceId: serviceId ? new ObjectId(serviceId) : null,
      providerId: providerId ? new ObjectId(providerId) : null,
      sellingPrice: price,
      providerCost: cost,
      netProfit,
      deliveryTime: deliveryTime || "",
      status: status || "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("admin_orders").insertOne(newOrder);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId: result.insertedId,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create order",
        error: error.message,
      });
  }
};

const getAdminOrders = async (req, res) => {
  try {
    const db = getDb();
    const { status, search } = req.query;

    let query = {};
    if (status && status !== "All") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { whatsapp: { $regex: search, $options: "i" } },
        { targetLink: { $regex: search, $options: "i" } },
      ];
      if (ObjectId.isValid(search)) {
        query.$or.push({ _id: new ObjectId(search) });
      }
    }

    const orders = await db
      .collection("admin_orders")
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "services",
            localField: "serviceId",
            foreignField: "_id",
            as: "publicService",
          },
        },
        {
          $lookup: {
            from: "internal_services",
            localField: "serviceId",
            foreignField: "_id",
            as: "internalService",
          },
        },
        {
          $lookup: {
            from: "providers",
            localField: "providerId",
            foreignField: "_id",
            as: "providerInfo",
          },
        },
        {
          $addFields: {
            serviceInfo: {
              $cond: {
                if: { $gt: [{ $size: "$publicService" }, 0] },
                then: { $arrayElemAt: ["$publicService", 0] },
                else: { $arrayElemAt: ["$internalService", 0] },
              },
            },
            providerInfo: { $arrayElemAt: ["$providerInfo", 0] },
          },
        },
        {
          $project: {
            publicService: 0,
            internalService: 0,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      });
  }
};

const getAdminOrderStats = async (req, res) => {
  try {
    const db = getDb();
    const stats = await db
      .collection("admin_orders")
      .aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
            },
            processingOrders: {
              $sum: { $cond: [{ $eq: ["$status", "Processing"] }, 1, 0] },
            },
            completedOrders: {
              $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
            },
            totalSales: { $sum: "$sellingPrice" },
            totalCost: { $sum: "$providerCost" },
            totalProfit: { $sum: "$netProfit" },
          },
        },
      ])
      .toArray();

    const defaultStats = {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      completedOrders: 0,
      totalSales: 0,
      totalCost: 0,
      totalProfit: 0,
    };

    res
      .status(200)
      .json({
        success: true,
        data: stats.length > 0 ? stats[0] : defaultStats,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch stats",
        error: error.message,
      });
  }
};

const getAdminOrderById = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const order = await db
      .collection("admin_orders")
      .findOne({ _id: new ObjectId(id) });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch order",
        error: error.message,
      });
  }
};

const updateAdminOrder = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    if (
      updateData.sellingPrice !== undefined ||
      updateData.providerCost !== undefined
    ) {
      const price = Number(updateData.sellingPrice) || 0;
      const cost = Number(updateData.providerCost) || 0;
      updateData.sellingPrice = price;
      updateData.providerCost = cost;
      updateData.netProfit = price - cost;
    }

    if (updateData.serviceId)
      updateData.serviceId = new ObjectId(updateData.serviceId);
    if (updateData.providerId)
      updateData.providerId = new ObjectId(updateData.providerId);
    delete updateData._id;

    const result = await db
      .collection("admin_orders")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Order updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update order",
        error: error.message,
      });
  }
};

const updateAdminOrderStatus = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }

    const result = await db
      .collection("admin_orders")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } },
      );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update status",
        error: error.message,
      });
  }
};

const deleteAdminOrder = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const result = await db
      .collection("admin_orders")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete order",
        error: error.message,
      });
  }
};

export {
  createAdminOrder,
  getAdminOrders,
  getAdminOrderStats,
  getAdminOrderById,
  updateAdminOrder,
  updateAdminOrderStatus,
  deleteAdminOrder,
};
