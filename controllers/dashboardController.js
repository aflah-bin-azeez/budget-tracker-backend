import Category from "../models/Category.js";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import mongoose from "mongoose";

export const getDashboardData = async (req, res) => {
  try {
    const { month } = req.query;
    const userId = req.headers.userid;

    let monthString;
    if (month.includes("-")) {
      monthString = month; 
    } else {
      const year = new Date().getFullYear();
      monthString = `${year}-${month.padStart(2, "0")}`; 
    }

    let start, end;
    if (month.includes("-")) {
      const [year, monthNum] = month.split("-");
      start = new Date(year, monthNum - 1, 1);
      end = new Date(year, monthNum, 0, 23, 59, 59, 999);
    } else {
      const year = new Date().getFullYear();
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0, 23, 59, 59, 999);
    }

    const categories = await Category.find({ userId });
    const result = [];

    for (let cat of categories) {
      const budget = await Budget.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        categoryId: new mongoose.Types.ObjectId(cat._id),
        month: monthString,
      });

      const limit = budget ? budget.limit : 0;

      const spentData = await Expense.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            categoryId: new mongoose.Types.ObjectId(cat._id),
            date: { $gte: start, $lte: end },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const spent = spentData[0]?.total || 0;
      const remaining = limit - spent;

      result.push({
        _id: cat._id,
        name: cat.name,
        color: cat.color,
        spent,
        limit,
        remaining,
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
