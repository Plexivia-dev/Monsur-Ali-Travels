import express from "express";
import {
  getAllVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  generateQrEndpoint,
} from "../controllers/CashVoucherController.js";

const cashVoucherRouter = express.Router();

// Standalone QR endpoint (must come before /:id)
cashVoucherRouter.get("/qr-code", generateQrEndpoint);

cashVoucherRouter.get("/",      getAllVouchers);
cashVoucherRouter.get("/:id",   getVoucherById);
cashVoucherRouter.post("/",     createVoucher);
cashVoucherRouter.put("/:id",   updateVoucher);
cashVoucherRouter.delete("/:id", deleteVoucher);

export default cashVoucherRouter;
