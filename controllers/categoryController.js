import Budget from "../models/Budget.js";
import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  const categories = await Category.find({ userId: req.headers.userid });
  res.json(categories);
};

export const addCategory = async (req, res) => {
  const { name, color } = req.body;

  const category = await Category.create({
    userId: req.headers.userid,
    name,
    color,
  });

  res.json(category);
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;

  const category = await Category.findOneAndUpdate(
    { _id: id, userId: req.headers.userid },
    { name, color },
    { new: true }
  );

  res.json(category);
};


export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  const isCategoryUsed = await Budget.findOne({
    categoryId: id,
    userId: req.headers.userid,
  });

  if (isCategoryUsed) {
    return res.status(400).json({
      message: "This category cannot be deleted because it is linked to a budget.",
    });
  }

  await Category.findOneAndDelete({ _id: id, userId: req.headers.userid });

  res.json({ message: "Category deleted" });
};