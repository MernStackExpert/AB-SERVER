import { getDb } from "../config/db.js";
import { ObjectId } from "mongodb";

const createOrder = async (req, res) => {
  try {
    const db = getDb();
    const { serviceId, serviceType , customerName, whatsapp, phone, email, message } =
      req.body;

    if (!serviceId || !customerName || !whatsapp) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Service ID, Name, and WhatsApp are required",
        });
    }

    const service = await db
      .collection("services")
      .findOne({ _id: new ObjectId(serviceId) });
    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    const newOrder = {
      serviceId: new ObjectId(serviceId),
      serviceTitle: service.title,
      serviceCategory: service.category,
      serviceType,
      price: service.price,
      customerInfo: {
        name: customerName,
        whatsapp,
        phone: phone || whatsapp,
        email: email || "",
        message: message || "",
      },
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(newOrder);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: result.insertedId,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to place order",
        error: error.message,
      });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const db = getDb();
    const {
      status,
      category,
      search,
      startDate,
      endDate,
      sortBy,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    if (status) query.status = status;
    if (category) query.serviceCategory = category;

    if (search) {
      query.$or = [
        { "customerInfo.name": { $regex: search, $options: "i" } },
        { "customerInfo.whatsapp": { $regex: search, $options: "i" } },
        { "customerInfo.email": { $regex: search, $options: "i" } },
        { serviceTitle: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === "oldest") sortOption = { createdAt: 1 };
    if (sortBy === "price_asc") sortOption = { price: 1 };
    if (sortBy === "price_desc") sortOption = { price: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await db.collection("orders").countDocuments(query);
    const orders = await db
      .collection("orders")
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
      data: orders,
    });
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

const getOrderById = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const order = await db
      .collection("orders")
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
        message: "Failed to fetch order details",
        error: error.message,
      });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    let updateData = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const result = await db
      .collection("orders")
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

const deleteOrder = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const result = await db
      .collection("orders")
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
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
