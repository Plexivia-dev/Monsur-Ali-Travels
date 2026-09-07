import { Router } from "express";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  updateClientStatus,
} from "../../controllers/client/CandidateController.js";

const clientRouter = Router();

clientRouter.route("/")
  .get(getClients)
  .post(createClient);

clientRouter.route("/:id")
  .get(getClientById)
  .put(updateClient)
  .delete(deleteClient);

clientRouter.patch("/:id/status", updateClientStatus);

export default clientRouter;
