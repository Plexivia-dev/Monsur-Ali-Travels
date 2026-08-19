import prisma from '../config/prisma.js';
import { generateDid } from '../utils/generateDid.js';
import { generateCustomerCode } from '../utils/trackingNumbers.js';

/**
 * @typedef {Object} SyncCustomerInput
 * @property {string} fullName - Customer full name
 * @property {string} [phone] - Customer phone number
 * @property {string} [nidNumber] - NID number
 * @property {string} [passportNumber] - Passport number
 * @property {string} [fatherName] - Father's name
 * @property {string} [motherName] - Mother's name
 * @property {string} [email] - Email address
 * @property {string} [presentAddress] - Present address
 * @property {Object} [guardian] - Guardian info
 * @property {Object} [attachments] - Photo / Scan attachments
 * @property {Object} [payment] - Payment object { totalAmount, paidAmount, advancePaid }
 * @property {string} [createdById] - User ID who submitted
 */

export class CustomerSyncService {
  /**
   * Automatically finds an existing Central Customer profile by Passport / NID / Phone,
   * or creates a new profile if no match exists. Also updates billing totals.
   * 
   * @param {SyncCustomerInput} input
   * @returns {Promise<any>} The synchronized customer record
   */
  static async syncCustomerProfile({
    fullName,
    phone = '',
    nidNumber = '',
    passportNumber = '',
    fatherName = '',
    motherName = '',
    email = '',
    presentAddress = '',
    guardian = {},
    attachments = {},
    payment = null,
    createdById = null,
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
        customer = await prisma.customer.findFirst({
          where: {
            OR: searchConditions,
            isActive: true,
          },
        });
      }

      const photo = attachments.passportPhoto || attachments.photo || '';
      const passportScan = attachments.passportScan || '';
      const nidScan = attachments.nidScan || '';

      const billedIncrement = Number(payment?.totalAmount || payment?.totalFee || 0);
      const paidIncrement = Number(payment?.advancePaid || payment?.paidAmount || 0);

      if (!customer) {
        // Create new Central Customer profile
        const did = generateDid();
        const customerCode = generateCustomerCode();

        customer = await prisma.customer.create({
          data: {
            did,
            customerCode,
            fullName: fullName.trim(),
            phone: phone ? phone.trim() : 'N/A',
            nidNumber: nidNumber ? nidNumber.trim() : '',
            passportNumber: passportNumber ? passportNumber.trim().toUpperCase() : '',
            fatherName: fatherName || '',
            motherName: motherName || '',
            email: email ? email.toLowerCase().trim() : '',
            presentAddress: presentAddress || '',
            guardian: {
              name: guardian.fullName || guardian.name || '',
              phone: guardian.mobileNumber || guardian.phone || '',
              nidNumber: guardian.nidNumber || '',
              relationship: guardian.relationship || 'Father',
              address: guardian.address || '',
            },
            attachments: {
              photo,
              passportScan,
              nidScan,
              otherDocuments: attachments.otherFiles || [],
            },
            totalBilledAmount: billedIncrement,
            totalPaidAmount: paidIncrement,
            totalDueAmount: Math.max(0, billedIncrement - paidIncrement),
            createdById,
          },
        });
      } else {
        // Update existing Central Customer profile with any newly provided details
        const updateData = {};

        if (!customer.nidNumber && nidNumber) updateData.nidNumber = nidNumber.trim();
        if (!customer.passportNumber && passportNumber) updateData.passportNumber = passportNumber.trim().toUpperCase();
        if (!customer.fatherName && fatherName) updateData.fatherName = fatherName;
        if (!customer.motherName && motherName) updateData.motherName = motherName;
        if (!customer.email && email) updateData.email = email.toLowerCase().trim();
        if (!customer.presentAddress && presentAddress) updateData.presentAddress = presentAddress;

        // Update billing ledger if payment info provided
        if (billedIncrement > 0 || paidIncrement > 0) {
          const currentBilled = Number(customer.totalBilledAmount || 0);
          const currentPaid = Number(customer.totalPaidAmount || 0);
          const newBilled = currentBilled + billedIncrement;
          const newPaid = currentPaid + paidIncrement;

          updateData.totalBilledAmount = newBilled;
          updateData.totalPaidAmount = newPaid;
          updateData.totalDueAmount = Math.max(0, newBilled - newPaid);
        }

        // Update attachments if newer ones provided
        if (photo || passportScan || nidScan) {
          const currentAttachments = typeof customer.attachments === 'object' && customer.attachments !== null ? customer.attachments : {};
          updateData.attachments = {
            photo: photo || currentAttachments.photo || '',
            passportScan: passportScan || currentAttachments.passportScan || '',
            nidScan: nidScan || currentAttachments.nidScan || '',
            otherDocuments: currentAttachments.otherDocuments || [],
          };
        }

        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: updateData,
        });
      }

      return customer;
    } catch (error) {
      console.error('⚠️ CustomerSyncService error:', error.message);
      return null;
    }
  }
}

export default CustomerSyncService;
