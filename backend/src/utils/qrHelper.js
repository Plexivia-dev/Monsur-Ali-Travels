import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory cache for generated QR codes to avoid recomputation
const qrCache = new Map();

/**
 * Load agency information from config/information.json
 */
export function getAgencyInfo() {
  try {
    const configPath = path.join(__dirname, "..", "config", "information.json");
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not load backend information.json, using fallback:", err.message);
  }

  return {
    agencyName: "Monsur Ali Tours & Travels",
    brandTitle: "MONSUR ALI",
    brandSubtitle: "TOURS & TRAVELS",
    tagline: "Your Trusted Travel Partner",
    phone: "+8801345579534",
    phoneLocal: "01345-579534",
    email: "contact@monsuralitravels.com",
    domain: "monsuralitravels.com",
    website: "www.monsuralitravels.com",
    address: {
      village: "Mominpur",
      road: "Jagannathpur Road",
      district: "Sunamganj",
      postcode: "3060",
      country: "Bangladesh",
      full: "Mominpur Jagannathpur Road, Sunamganj, Post Code 3060",
      fullBn: "মমিনপুর জগন্নাথপুর রোড, সুনামগঞ্জ, পোস্ট কোড ৩০৬০"
    }
  };
}

/**
 * Sanitize hex color strings (defaults to Monsur Ali slate navy #0f172a)
 */
export function sanitizeHexColor(color, defaultColor = "#0f172a") {
  if (!color) return defaultColor;
  const clean = color.trim().replace(/^#/, "");
  if (/^[0-9A-Fa-f]{6}$/.test(clean) || /^[0-9A-Fa-f]{8}$/.test(clean)) {
    return `#${clean}`;
  }
  return defaultColor;
}

/**
 * Formats Agency contact information for QR scanning
 * @param {string} mode - "text" (clean formatted contact summary) | "vcard" (importable phone contact card) | "url"
 */
export function formatAgencyQrText(mode = "text", customAgencyInfo = null) {
  const info = customAgencyInfo || getAgencyInfo();

  if (mode === "vcard") {
    return [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${info.agencyName}`,
      `ORG:${info.agencyName}`,
      `TITLE:${info.tagline || "Travel Agency"}`,
      `TEL;TYPE=WORK,VOICE:${info.phone}`,
      `EMAIL;TYPE=WORK:${info.email}`,
      `URL:https://${info.domain || info.website}`,
      `ADR;TYPE=WORK:;;${info.address?.road || ""};${info.address?.district || "Sunamganj"};;${info.address?.postcode || "3060"};${info.address?.country || "Bangladesh"}`,
      `NOTE:${info.tagline || "Your Trusted Travel Partner"}`,
      "END:VCARD"
    ].join("\n");
  }

  if (mode === "url") {
    return `https://${info.domain || info.website}`;
  }

  // Default clean human-readable text when scanned by any phone/scanner app
  return [
    `🏢 ${info.agencyName?.toUpperCase()}`,
    `✨ ${info.tagline || "Your Trusted Travel Partner"}`,
    `📍 ${info.address?.full || "Mominpur Jagannathpur Road, Sunamganj, Post Code 3060"}`,
    `📞 Helpline: ${info.phone} / ${info.phoneLocal || ""}`,
    `✉️ Email: ${info.email}`,
    `🌐 Website: https://${info.domain || info.website}`
  ].join("\n");
}

/**
 * Formats Invoice verification payload for QR code
 */
export function formatInvoiceQrText(invoiceData = {}, customAgencyInfo = null) {
  const info = customAgencyInfo || getAgencyInfo();
  const invoiceNo = invoiceData.invoiceNo || "N/A";
  const clientName = invoiceData.client?.name || "সম্মানিত ক্লায়েন্ট";
  const total = invoiceData.grandTotal || invoiceData.subtotal || 0;
  const currency = invoiceData.currency || "BDT";
  const status = invoiceData.paymentStatus || "Paid";
  const date = invoiceData.issueDate || new Date().toISOString().slice(0, 10);

  return [
    `📄 ${info.agencyName?.toUpperCase()} - OFFICIAL INVOICE`,
    `-----------------------------------------`,
    `Invoice No: ${invoiceNo}`,
    `Billed To: ${clientName}`,
    `Total Amount: ৳ ${Number(total).toLocaleString("en-IN")} ${currency}`,
    `Payment Status: ${status}`,
    `Issue Date: ${date}`,
    `Helpline: ${info.phone}`,
    `Website: https://${info.domain || info.website}`
  ].join("\n");
}

/**
 * Normalizes options for QRCode generator
 */
export function getNormalizedQrOptions(options = {}) {
  const width = Math.min(Math.max(parseInt(options.width || options.size, 10) || 300, 50), 2000);
  const margin = Math.min(Math.max(parseInt(options.margin, 10) || 2, 0), 10);
  const ec = ["L", "M", "Q", "H"].includes(String(options.ec || options.errorCorrectionLevel).toUpperCase())
    ? String(options.ec || options.errorCorrectionLevel).toUpperCase()
    : "M";

  const darkColor = sanitizeHexColor(options.color || options.dark, "#0f172a");
  const lightColor = sanitizeHexColor(options.bgcolor || options.light, "#ffffff");

  return {
    errorCorrectionLevel: ec,
    margin,
    width,
    color: {
      dark: darkColor,
      light: lightColor
    }
  };
}

/**
 * Generates PNG Buffer
 */
export async function generateQrBuffer(text, options = {}) {
  const qrOptions = getNormalizedQrOptions(options);
  return await QRCode.toBuffer(text, { ...qrOptions, type: "png" });
}

/**
 * Generates SVG String
 */
export async function generateQrSvg(text, options = {}) {
  const qrOptions = getNormalizedQrOptions(options);
  return await QRCode.toString(text, { ...qrOptions, type: "svg" });
}

/**
 * Generates Base64 Data URL (e.g. data:image/png;base64,...)
 */
export async function generateQrDataUrl(text, options = {}) {
  const qrOptions = getNormalizedQrOptions(options);
  return await QRCode.toDataURL(text, qrOptions);
}

/**
 * Cached Agency QR Code retrieval
 */
export async function getCachedAgencyQr(format = "dataurl", mode = "text", options = {}) {
  const cacheKey = `agency:${format}:${mode}:${JSON.stringify(options)}`;
  if (qrCache.has(cacheKey)) {
    return qrCache.get(cacheKey);
  }

  const text = formatAgencyQrText(mode);
  let result;

  if (format === "svg") {
    result = await generateQrSvg(text, options);
  } else if (format === "png") {
    result = await generateQrBuffer(text, options);
  } else {
    result = await generateQrDataUrl(text, options);
  }

  qrCache.set(cacheKey, result);
  return result;
}
