import { getDb } from "../config/db.js";
import { ObjectId } from "mongodb";

const addCategory = async (req, res) => {
  try {
    const db = getDb();
    const { name, slug, serviceType, icon, image, status } = req.body;

    if (!name || !name.en || !name.bn || !slug) {
      return res.status(400).json({
        success: false,
        message: "Category name (English & Bengali) and slug are required",
      });
    }

    const existingCategory = await db
      .collection("categories")
      .findOne({ slug });
    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category slug already exists" });
    }

    const newCategory = {
      name: {
        en: name.en,
        bn: name.bn,
      },
      slug,
      serviceType,
      icon: icon || "",
      image: image || "",
      status: status || "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("categories").insertOne(newCategory);

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      categoryId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add category",
      error: error.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const db = getDb();
    const { status } = req.query;

    let matchQuery = {};
    if (status) matchQuery.status = status;

    const categories = await db
      .collection("categories")
      .aggregate([
        { $match: matchQuery },
        {
          $lookup: {
            from: "services",
            localField: "slug", 
            foreignField: "category",
            as: "matchedServices",
          },
        },
        {
          $addFields: {
            serviceCount: {
              $size: {
                $filter: {
                  input: "$matchedServices",
                  as: "service",
                  cond: { $ne: ["$$service.status", "deleted"] }, 
                },
              },
            },
          },
        },
        {
          $project: {
            matchedServices: 0, 
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const category = await db
      .collection("categories")
      .findOne({ _id: new ObjectId(id) });
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData._id;

    if (updateData.slug) {
      const existingCategory = await db.collection("categories").findOne({
        slug: updateData.slug,
        _id: { $ne: new ObjectId(id) },
      });
      if (existingCategory) {
        return res
          .status(400)
          .json({ success: false, message: "Category slug already exists" });
      }
    }

    const result = await db
      .collection("categories")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Category updated successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const result = await db
      .collection("categories")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

export {
  addCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
