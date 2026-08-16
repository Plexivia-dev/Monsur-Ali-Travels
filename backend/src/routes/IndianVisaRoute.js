import { Router } from "express";
import { IndianVisaController } from "../controllers/IndianVisaController.js";

const indianVisaRouter = Router();

// GET /api/v1/indian-visas & POST /api/v1/indian-visas
indianVisaRouter
  .route("/")
  .get(IndianVisaController.getAll)
  .post(IndianVisaController.create);

// GET /api/v1/indian-visas/:id & PUT/DELETE /api/v1/indian-visas/:id
indianVisaRouter
  .route("/:id")
  .get(IndianVisaController.getById)
  .put(IndianVisaController.update)
  .delete(IndianVisaController.delete);

export default indianVisaRouter;
