import { Router } from "express";
import { IdCardController } from "../controllers/IdCardController.js";

const idCardRouter = Router();

// GET /api/v1/id-cards & POST /api/v1/id-cards
idCardRouter
  .route("/")
  .get(IdCardController.getAll)
  .post(IdCardController.create);

// GET /api/v1/id-cards/:id & PUT/DELETE /api/v1/id-cards/:id
idCardRouter
  .route("/:id")
  .get(IdCardController.getById)
  .put(IdCardController.update)
  .delete(IdCardController.delete);

export default idCardRouter;
