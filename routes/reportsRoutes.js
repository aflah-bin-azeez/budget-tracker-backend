import express from "express";
import { getMonthlySummary, getCategoryReport, getBudgetComparison, getDateRangeReport } from "../controllers/reportController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/budget-vs-expense", auth, getBudgetComparison);
router.get("/monthly", auth, getMonthlySummary);
router.get("/by-category", auth, getCategoryReport);
router.get("/range", auth, getDateRangeReport);

export default router;
