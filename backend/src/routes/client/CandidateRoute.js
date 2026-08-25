import { Router } from "express";
import {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  updateCandidateStatus,
} from "../../controllers/client/CandidateController.js";

const candidateRouter = Router();

candidateRouter.route("/")
  .get(getCandidates)
  .post(createCandidate);

candidateRouter.route("/:id")
  .get(getCandidateById)
  .put(updateCandidate)
  .delete(deleteCandidate);

candidateRouter.patch("/:id/status", updateCandidateStatus);

export default candidateRouter;
