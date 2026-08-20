import { Router } from "express";
import {
  getPassportSubmissions,
  getPassportSubmissionById,
  createPassportSubmission,
  updatePassportSubmission,
  deletePassportSubmission,
  updatePassportStage,
} from "../../controllers/client/PassportSubmissionController.js";

const passportRouter = Router();

// GET /api/v1/passports & POST /api/v1/passports
passportRouter
  .route("/")
  .get(getPassportSubmissions)
  .post(createPassportSubmission);

// PATCH /api/v1/passports/:id/stage
passportRouter.patch("/:id/stage", updatePassportStage);

// GET /api/v1/passports/:id & PUT/DELETE /api/v1/passports/:id
passportRouter
  .route("/:id")
  .get(getPassportSubmissionById)
  .put(updatePassportSubmission)
  .delete(deletePassportSubmission);

export default passportRouter;
