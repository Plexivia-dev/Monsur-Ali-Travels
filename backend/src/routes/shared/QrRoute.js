import { Router } from "express";
import {
  generateUniversalQr,
  getAgencyQr,
  getInvoiceQr,
  verifyRecord
} from "../../controllers/shared/QrController.js";

const qrRouter = Router();

// Public Verification Endpoints: GET /api/v1/qr/verify/:identifier or GET /api/v1/qr/verify?id=...
qrRouter.get("/verify/:identifier", verifyRecord);
qrRouter.get("/verify", verifyRecord);

// Universal dynamic QR generator: GET /api/v1/qr & POST /api/v1/qr
qrRouter
  .route("/")
  .get(generateUniversalQr)
  .post(generateUniversalQr);

// Agency branding QR code (from information.json): GET /api/v1/qr/agency
qrRouter
  .route("/agency")
  .get(getAgencyQr);

// Invoice QR code: GET /api/v1/qr/invoice/:id
qrRouter
  .route("/invoice/:id")
  .get(getInvoiceQr);

export default qrRouter;
