import express from "express";
import auth from "../middleware/auth.js";
import { getCategories, addCategory, updateCategory, deleteCategory, } from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", auth, getCategories);
router.post("/", auth, addCategory);
router.put("/:id", auth, updateCategory);
router.delete("/:id", auth, deleteCategory);

export default router;
