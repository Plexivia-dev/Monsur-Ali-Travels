import { Router } from "express";
import { searchProducts } from "../controllers/SearchController.js";

const searchRouter = Router();

// GET /api/v1/search?q=term&limit=12
searchRouter.get("/", searchProducts);

export default searchRouter;
