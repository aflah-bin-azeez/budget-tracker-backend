import Expense from "../models/Expense.js";
import Category from "../models/Category.js";
import Budget from "../models/Budget.js";
import mongoose from "mongoose";

export const addExpense = async (req, res) => {
  const { categoryId, amount, date } = req.body;

  // Validate date
  const expenseDate = date ? new Date(date) : new Date();
  if (isNaN(expenseDate.getTime())) {
    return res.status(400).json({ message: "Invalid date" });
  }

  // Save expense
  const expense = await Expense.create({
    userId: req.headers.userid,
    categoryId,
    amount,
    date: expenseDate,
  });

  // Budget check
  const month = expenseDate.toISOString().slice(0, 7);
  const budget = await Budget.findOne({
    userId: req.headers.userid,
    categoryId,
    month,
  });

  const limit = budget ? budget.limit : 0;

  const start = new Date(`${month}-01T00:00:00.000Z`);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);

  const spentData = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.headers.userid),
        categoryId: new mongoose.Types.ObjectId(categoryId),
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const spent = spentData[0]?.total || 0;
  const remaining = limit - spent;
  const status = remaining >= 0 ? "Within Budget" : "Over Budget";

  res.json({
    message: "Expense Added",
    status,
    spent,
    limit,
    remaining,
    expense,
  });
};



export const getExpenses = async (req, res) => {
  const { month } = req.query; // "2025-01"

  const start = new Date(month + "-01");
  const end = new Date(month + "-31");

  const expenses = await Expense.find({
    userId: req.headers.userid,
    date: { $gte: start, $lte: end },
  }).populate("categoryId", "name color");

  res.json(expenses);
};


export const deleteExpense = async (req, res) => {
  const { id } = req.params;

  await Expense.findOneAndDelete({
    _id: id,
    userId: req.headers.userid,
  });

  res.json({ message: "Expense deleted" });
};
