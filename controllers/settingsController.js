import { getDb } from "../config/db.js";

const defaultSettings = {
  websiteName: "AK Digital",
  logoUrl: "",
  topNavMessage: {
    active: false,
    message: "Welcome to AK Digital! Enjoy our premium services.",
  },
  contactInformation: {
    whatsapp: "",
    phone: "",
    email: "",
    address: "",
    facebook: "",
    telegram: "",
    tiktok: "",
    instagram: "",
    youtube: "",
  },
  footerText: "© 2026 AK Digital. All rights reserved.",
  seoMetaTitle: "AK Digital - Premium Digital Services & Accounts",
  seoMetaDescription:
    "Buy professional digital services, YouTube channels, Facebook pages, and TikTok accounts at the best price.",
  websiteLock: {
    isLocked: false,
    message: "Website is currently under maintenance. Please come back later.",
  },
  themeColor: "#000000",
  currency: "BDT",
};

const getSettings = async (req, res) => {
  try {
    const db = getDb();

    const settings = await db.collection("settings").findOne({});

    if (!settings) {
      return res.status(200).json({ success: true, data: defaultSettings });
    }

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch settings",
        error: error.message,
      });
  }
};

const updateSettings = async (req, res) => {
  try {
    const db = getDb();

    const updateData = {
      websiteName: req.body.websiteName,
      logoUrl: req.body.logoUrl,
      topNavMessage: req.body.topNavMessage,
      contactInformation: req.body.contactInformation,
      footerText: req.body.footerText,
      seoMetaTitle: req.body.seoMetaTitle,
      seoMetaDescription: req.body.seoMetaDescription,
      websiteLock: req.body.websiteLock,
      themeColor: req.body.themeColor,
      currency: req.body.currency,
      updatedAt: new Date(),
    };

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const result = await db
      .collection("settings")
      .updateOne({}, { $set: updateData }, { upsert: true });

    res
      .status(200)
      .json({
        success: true,
        message: "Website settings updated successfully",
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update settings",
        error: error.message,
      });
  }
};

export { getSettings, updateSettings };
 