import { Router } from "express";
import {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from "../controllers/CandidateController.js";

const candidateRouter = Router();

candidateRouter.route("/")
  .get(getCandidates)
  .post(createCandidate);

candidateRouter.route("/:id")
  .get(getCandidateById)
  .put(updateCandidate)
  .delete(deleteCandidate);

export default candidateRouter;
