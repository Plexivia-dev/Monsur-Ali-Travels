import Customer from "../models/customer.model.js";

/**
 * Helper to link or create a customer profile from any document form submission
 * Matches by passportNumber, nidNumber, or phone
 */
export async function syncCustomerProfile({
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

    const searchConditions = [];
    if (passportNumber && passportNumber.trim()) {
      searchConditions.push({ passportNumber: passportNumber.trim().toUpperCase() });
    }
    if (nidNumber && nidNumber.trim()) {
      searchConditions.push({ nidNumber: nidNumber.trim() });
    }
    if (phone && phone.trim()) {
      searchConditions.push({ phone: phone.trim() });
    }

    let customer = null;
    if (searchConditions.length > 0) {
      customer = await Customer.findOne({ $or: searchConditions });
    }

    // Prepare attachment updates if provided
    const photo = attachments.passportPhoto || attachments.photo || "";
    const passportScan = attachments.passportScan || "";
    const nidScan = attachments.nidScan || "";

    if (!customer) {
      // Create new customer profile
      customer = new Customer({
        fullName,
        phone: phone || "N/A",
        nidNumber,
        passportNumber: passportNumber.toUpperCase(),
        fatherName,
        motherName,
        email,
        presentAddress,
        guardian: {
          name: guardian.fullName || guardian.name || "",
          phone: guardian.mobileNumber || guardian.phone || "",
          nidNumber: guardian.nidNumber || "",
          relationship: guardian.relationship || "Father",
          address: guardian.address || "",
        },
        attachments: {
          photo,
          passportScan,
          nidScan,
          otherDocuments: attachments.otherFiles || [],
        },
      });
    } else {
      // Update missing fields
      if (!customer.nidNumber && nidNumber) customer.nidNumber = nidNumber;
      if (!customer.passportNumber && passportNumber) customer.passportNumber = passportNumber.toUpperCase();
      if (!customer.fatherName && fatherName) customer.fatherName = fatherName;
      if (!customer.motherName && motherName) customer.motherName = motherName;
      if (!customer.email && email) customer.email = email;
      if (!customer.presentAddress && presentAddress) customer.presentAddress = presentAddress;
      
      // Update attachments if newer ones provided
      if (photo && !customer.attachments?.photo) {
        customer.attachments = customer.attachments || {};
        customer.attachments.photo = photo;
      }
      if (passportScan && !customer.attachments?.passportScan) {
        customer.attachments = customer.attachments || {};
        customer.attachments.passportScan = passportScan;
      }
      if (nidScan && !customer.attachments?.nidScan) {
        customer.attachments = customer.attachments || {};
        customer.attachments.nidScan = nidScan;
      }
    }

    // Attach relational link ID
    if (relationId) {
      if (relationType === "application" && !customer.applications.includes(relationId)) {
        customer.applications.push(relationId);
      } else if (relationType === "visa" && !customer.visaSubmissions.includes(relationId)) {
        customer.visaSubmissions.push(relationId);
      } else if (relationType === "passport" && !customer.passportSubmissions.includes(relationId)) {
        customer.passportSubmissions.push(relationId);
      } else if (relationType === "case" && !customer.candidateCases.includes(relationId)) {
        customer.candidateCases.push(relationId);
      } else if (relationType === "agreement" && !customer.agreements.includes(relationId)) {
        customer.agreements.push(relationId);
      } else if (relationType === "invoice" && !customer.invoices.includes(relationId)) {
        customer.invoices.push(relationId);
      }
    }

    // Update billing summary if payment provided
    if (payment) {
      const total = Number(payment.totalAmount || 0);
      const paid = Number(payment.advancePaid || payment.paidAmount || 0);
      customer.totalBilledAmount = (customer.totalBilledAmount || 0) + total;
      customer.totalPaidAmount = (customer.totalPaidAmount || 0) + paid;
      customer.totalDueAmount = Math.max(0, customer.totalBilledAmount - customer.totalPaidAmount);
    }

    await customer.save();
    return customer;
  } catch (err) {
    console.error("Error in syncCustomerProfile helper:", err);
    return null;
  }
}
