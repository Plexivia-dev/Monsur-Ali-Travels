import { Router } from "express";
import {
  generateUniversalQr,
  getAgencyQr,
  getInvoiceQr
} from "../controllers/QrController.js";

const qrRouter = Router();

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
