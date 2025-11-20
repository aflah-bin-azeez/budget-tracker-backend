import express from "express";
import auth from "../middleware/auth.js";
import {
    setBudget,
    getBudgets,
    deleteBudget,
} from "../controllers/budgetController.js";

const router = express.Router();

router.get("/", auth, getBudgets);     // GET /budgets?month=2025-01
router.post("/", auth, setBudget);     // POST /budgets
router.delete("/:id", auth, deleteBudget);

export default router;
