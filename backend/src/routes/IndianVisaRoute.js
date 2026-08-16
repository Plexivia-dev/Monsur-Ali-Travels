import { Router } from "express";
import { IndianVisaController } from "../controllers/IndianVisaController.js";

const indianVisaRouter = Router();

// GET /api/v1/indian-visas & POST /api/v1/indian-visas
indianVisaRouter
  .route("/")
  .get(IndianVisaController.getAll)
  .post(IndianVisaController.create);

// GET /api/v1/indian-visas/:id & PUT/DELETE /api/v1/indian-visas/:id
indianVisaRouter.get('/:id', (req, res) => {
  IndianVisaController.getById(req, res);
});

indianVisaRouter.patch('/:id/stage', (req, res) => {
  IndianVisaController.updateStage(req, res);
});

indianVisaRouter.patch('/:id', (req, res) => {
  IndianVisaController.update(req, res);
});

indianVisaRouter.put('/:id', (req, res) => {
  IndianVisaController.update(req, res);
});

indianVisaRouter.delete('/:id', (req, res) => {
  IndianVisaController.delete(req, res);
});

export default indianVisaRouter;
