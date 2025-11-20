import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import mongoose from "mongoose";
import Category from "../models/Category.js";

// -----------------------------
// 1️⃣ MONTHLY SUMMARY
// -----------------------------
export const getMonthlySummary = async (req, res) => {
  const userId = req.user.id;

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const data = await Expense.aggregate([
    {
      $match: {
        userId,
        date: {
          $gte: new Date(year, month, 1),
          $lte: new Date(year, month + 1, 0)
        }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    }
  ]);

  res.json(data[0] || { total: 0, count: 0 });
};


// -----------------------------
// 2️⃣ CATEGORY-WISE REPORT
// -----------------------------
export const getCategoryReport = async (req, res) => {
  const userId = req.user.id;

  const report = await Expense.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: "$categoryId",
        totalSpent: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { totalSpent: -1 }
    }
  ]);

  res.json(report);
};


// -----------------------------
// 3️⃣ BUDGET vs EXPENSE
// -----------------------------
export const getBudgetComparison = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    const now = month ? new Date(month + "-01") : new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth();

    // 1️⃣ Aggregate expenses by category for the month
    const expenses = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: new Date(year, monthIndex, 1),
            $lte: new Date(year, monthIndex + 1, 0),
          },
        },
      },
      {
        $group: {
          _id: "$categoryId",
          totalSpent: { $sum: "$amount" },
        },
      },
    ]);

    // 2️⃣ Fetch budgets for the month
    const budgets = await Budget.find({
      userId: new mongoose.Types.ObjectId(userId),
      month: month ? month : `${year}-${(monthIndex + 1).toString().padStart(2, "0")}`,
    }).lean();

    // 3️⃣ Fetch category names for the budgets
    const categoryIds = budgets.map((b) => b.categoryId);
    const categories = await Category.find({ _id: { $in: categoryIds } }).lean();

    // 4️⃣ Build the report
    const report = budgets.map((b) => {
      const exp = expenses.find((e) => e._id.toString() === b.categoryId.toString());
      const cat = categories.find((c) => c._id.toString() === b.categoryId.toString());

      return {
        categoryId: b.categoryId,
        categoryName: cat ? cat.name : "Unknown",
        budget: b.limit,
        spent: exp ? exp.totalSpent : 0,
        remaining: b.limit - (exp ? exp.totalSpent : 0),
      };
    });

    res.json(report);
  } catch (err) {
    console.error("getBudgetComparison error:", err);
    res.status(500).json({ error: "Server error" });
  }
};



// -----------------------------
// 4️⃣ DATE RANGE REPORT
// (from=yyyy-mm-dd & to=yyyy-mm-dd)
// -----------------------------
export const getDateRangeReport = async (req, res) => {
  const userId = req.user.id;
  const { from, to } = req.query;

  const data = await Expense.aggregate([
    {
      $match: {
        userId,
        date: {
          $gte: new Date(from),
          $lte: new Date(to)
        }
      }
    },
    {
      $group: {
        _id: "$categoryId",
        totalSpent: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    }
  ]);

  res.json(data);
};
