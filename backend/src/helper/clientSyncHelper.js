import Client from "../models/client.model.js";

/**
 * Helper to link or create a client profile from any document form submission
 * Matches by passportNumber, nidNumber, or phone
 */
export async function syncClientProfile({
  fullName,
  phone,
  nidNumber = "",
  passportNumber = "",
  fatherName = "",
  motherName = "",
  email = "",
  presentAddress = "",
  guardian = {},
  attachments = {},
  relationType = "application", // 'application' | 'visa' | 'passport' | 'case' | 'invoice' | 'agreement'
  relationId = null,
  payment = null,
}) {
  try {
    if (!fullName || (!phone && !passportNumber && !nidNumber)) {
      return null;
    }

    const cleanPassport = passportNumber ? String(passportNumber).trim().toUpperCase() : "";
    const cleanPhone = phone ? String(phone).trim() : "";
    const cleanNid = nidNumber ? String(nidNumber).trim() : "";

    const searchConditions = [];
    if (cleanPassport) {
      searchConditions.push({ passportNumber: cleanPassport });
    }
    if (cleanNid) {
      searchConditions.push({ nidNumber: cleanNid });
    }
    if (cleanPhone) {
      searchConditions.push({ phone: cleanPhone });
    }

    let client = null;
    if (searchConditions.length > 0) {
      client = await Client.findOne({ $or: searchConditions });
    }

    // Prepare attachment updates if provided
    const photo = attachments?.passportPhoto || attachments?.photo || "";
    const passportScan = attachments?.passportScan || "";
    const nidScan = attachments?.nidScan || "";

    if (!client) {
      // Create new client profile
      client = new Client({
        fullName: String(fullName).trim(),
        phone: cleanPhone || "N/A",
        nidNumber: cleanNid,
        passportNumber: cleanPassport,
        fatherName: fatherName || "",
        motherName: motherName || "",
        email: email ? String(email).trim().toLowerCase() : "",
        presentAddress: presentAddress || "",
        guardian: {
          name: guardian?.fullName || guardian?.name || "",
          phone: guardian?.mobileNumber || guardian?.phone || "",
          nidNumber: guardian?.nidNumber || "",
          relationship: guardian?.relationship || "Father",
          address: guardian?.address || "",
        },
        attachments: {
          photo,
          passportScan,
          nidScan,
          otherDocuments: attachments?.otherFiles || [],
        },
      });
    } else {
      // Update missing fields
      if (!client.nidNumber && cleanNid) client.nidNumber = cleanNid;
      if (!client.passportNumber && cleanPassport) client.passportNumber = cleanPassport;
      if (!client.fatherName && fatherName) client.fatherName = fatherName;
      if (!client.motherName && motherName) client.motherName = motherName;
      if (!client.email && email) client.email = String(email).trim().toLowerCase();
      if (!client.presentAddress && presentAddress) client.presentAddress = presentAddress;
      
      // Update attachments if newer ones provided
      if (photo && !client.attachments?.photo) {
        client.attachments = client.attachments || {};
        client.attachments.photo = photo;
      }
      if (passportScan && !client.attachments?.passportScan) {
        client.attachments = client.attachments || {};
        client.attachments.passportScan = passportScan;
      }
      if (nidScan && !client.attachments?.nidScan) {
        client.attachments = client.attachments || {};
        client.attachments.nidScan = nidScan;
      }
    }

    // Ensure array properties exist
    client.applicationDids = client.applicationDids || [];
    client.visaSubmissionDids = client.visaSubmissionDids || [];
    client.passportSubmissionDids = client.passportSubmissionDids || [];
    client.clientCaseDids = client.clientCaseDids || [];
    client.agreementDids = client.agreementDids || [];
    client.invoiceDids = client.invoiceDids || [];

    // Attach relational link DID
    if (relationId) {
      if (relationType === "application" && !client.applicationDids.includes(relationId)) {
        client.applicationDids.push(relationId);
      } else if (relationType === "visa" && !client.visaSubmissionDids.includes(relationId)) {
        client.visaSubmissionDids.push(relationId);
      } else if (relationType === "passport" && !client.passportSubmissionDids.includes(relationId)) {
        client.passportSubmissionDids.push(relationId);
      } else if (relationType === "case" && !client.clientCaseDids.includes(relationId)) {
        client.clientCaseDids.push(relationId);
      } else if (relationType === "agreement" && !client.agreementDids.includes(relationId)) {
        client.agreementDids.push(relationId);
      } else if (relationType === "invoice" && !client.invoiceDids.includes(relationId)) {
        client.invoiceDids.push(relationId);
      }
    }

    // Update billing summary if payment provided
    if (payment) {
      const total = Number(payment.totalAmount || 0) || 0;
      const paid = Number(payment.advancePaid || payment.paidAmount || 0) || 0;
      client.totalBilledAmount = (Number(client.totalBilledAmount) || 0) + total;
      client.totalPaidAmount = (Number(client.totalPaidAmount) || 0) + paid;
      client.totalDueAmount = Math.max(0, client.totalBilledAmount - client.totalPaidAmount);
    }

    await client.save();
    return client;
  } catch (err) {
    console.error("Error in syncClientProfile helper:", err);
    return null;
  }
}
