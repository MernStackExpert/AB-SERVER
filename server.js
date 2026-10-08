import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToServer } from "./config/db.js";

import serviceRoutes from "./routes/serviceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import providerMappingRoutes from "./routes/providerMappingRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import internalServiceRoutes from "./routes/internalServiceRoutes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// API Routes
app.use("/api/services", serviceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/provider-mappings", providerMappingRoutes);
app.use("/api/internal-services", internalServiceRoutes);
app.use("/api/admin-orders", adminOrderRoutes);

app.get("/", (req, res) => {
  res.json({ message: "AK Digital Native Driver API is running..." });
});

connectToServer().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
