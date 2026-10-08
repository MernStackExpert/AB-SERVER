import { getDb } from "../config/db.js";

const getDashboardStats = async (req, res) => {
  try {
    const db = getDb();

    const revenueAggregation = await db
      .collection("orders")
      .aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
      ])
      .toArray();

    const totalRevenue =
      revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    const totalOrders = await db.collection("orders").countDocuments();
    const pendingOrders = await db
      .collection("orders")
      .countDocuments({ status: "pending" });
    const completedOrders = await db
      .collection("orders")
      .countDocuments({ status: "completed" });
    const canceledOrders = await db
      .collection("orders")
      .countDocuments({ status: "canceled" });

    const totalServices = await db.collection("services").countDocuments();
    const totalDigitalServices = await db
      .collection("services")
      .countDocuments({ category: "digital-service" });
    const totalAccountServices = await db
      .collection("services")
      .countDocuments({ category: { $ne: "digital-service" } });

    const totalCategories = await db.collection("categories").countDocuments();
    const totalProviders = await db.collection("providers").countDocuments();
    const totalUsers = await db.collection("users").countDocuments();

    const recentOrders = await db
      .collection("orders")
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Response Data
    const dashboardData = {
      revenue: {
        total: totalRevenue,
        currency: "BDT", 
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
        canceled: canceledOrders,
      },
      services: {
        total: totalServices,
        digitalServices: totalDigitalServices,
        accountServices: totalAccountServices,
      },
      others: {
        categories: totalCategories,
        providers: totalProviders,
        users: totalUsers,
      },
      recentOrders,
    };

    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch dashboard stats",
        error: error.message,
      });
  }
};

export { getDashboardStats };
