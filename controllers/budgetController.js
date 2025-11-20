import Budget from "../models/Budget.js";

export const setBudget = async (req, res) => {
  
  const { categoryId, month, limit } = req.body;

  let budget = await Budget.findOne({
    userId: req.headers.userid,
    categoryId,
    month,
  });

  if (budget) {
    budget.limit = limit;
    await budget.save();
  } else {
    budget = await Budget.create({
      userId: req.headers.userid,
      categoryId,
      month,
      limit,
    });
  }

  res.json(budget);
};


export const getBudgets = async (req, res) => {
  const { month } = req.query; // "2025-01"

  const budgets = await Budget.find({
    userId: req.headers.userid,
    month,
  }).populate("categoryId", "name color");

  res.json(budgets);
};


export const deleteBudget = async (req, res) => {
  const { id } = req.params;

  await Budget.findOneAndDelete({
    _id: id,
    userId: req.headers.userid,
  });

  res.json({ message: "Budget deleted" });
};
