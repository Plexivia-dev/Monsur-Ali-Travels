import prisma from '../config/prisma.js';
import { generateDid } from '../utils/generateDid.js';
import { generateUniqueInvoiceNo } from '../utils/trackingNumbers.js';
import { getPaginationMeta } from '../utils/apiResponse.js';
import CustomerSyncService from './CustomerSyncService.js';

export class InvoiceService {
  /**
   * List invoices
   */
  static async listInvoices({ page = 1, limit = 10, search, paymentStatus }) {
    const where = { isActive: true };

    if (paymentStatus && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus;
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { invoiceNo: { contains: term, mode: 'insensitive' } },
        { paymentStatus: { contains: term, mode: 'insensitive' } },
      ];
    }

    const totalCount = await prisma.invoice.count({ where });
    const skip = (page - 1) * limit;

    const invoices = await prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            fullName: true,
            phone: true,
            totalDueAmount: true,
          },
        },
      },
    });

    const pagination = getPaginationMeta(totalCount, page, limit);
    return { invoices, pagination };
  }

  /**
   * Get single invoice by ID
   */
  static async getInvoiceById(id) {
    const invoice = await prisma.invoice.findUnique({
      where: { id, isActive: true },
      include: { customer: true },
    });

    if (!invoice) {
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

    return invoice;
  }

  /**
   * Create invoice with subtotal & tax calculation and customer auto-sync
   */
  static async createInvoice(input, createdById = null) {
    const did = generateDid();
    const invoiceNo = generateUniqueInvoiceNo();

    // Calculate subtotal, tax and grandTotal
    let subtotal = 0;
    const items = (input.items || []).map((item) => {
      const qty = Number(item.quantity || 1);
      const rate = Number(item.rate || 0);
      const amount = qty * rate;
      subtotal += amount;
      return { ...item, quantity: qty, rate, amount };
    });

    const taxRate = Number(input.taxRate || 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const grandTotal = subtotal + taxAmount;

    // Sync Central Customer
    const customer = await CustomerSyncService.syncCustomerProfile({
      fullName: input.client.name,
      phone: input.client.phone,
      email: input.client.email,
      passportNumber: input.client.passportNo,
      presentAddress: input.client.address,
      payment: { totalAmount: grandTotal, advancePaid: input.paymentStatus === 'Paid' ? grandTotal : 0 },
      createdById,
    });

    const newInvoice = await prisma.invoice.create({
      data: {
        did,
        invoiceNo,
        customerId: customer?.id || null,
        issueDate: input.issueDate ? new Date(input.issueDate) : new Date(),
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        paymentStatus: input.paymentStatus || 'Pending',
        currency: input.currency || 'BDT',
        taxRate,
        biller: input.biller,
        client: input.client,
        items,
        paymentTerms: input.paymentTerms || '',
        subtotal,
        taxAmount,
        grandTotal,
      },
      include: { customer: true },
    });

    return newInvoice;
  }

  /**
   * Update invoice
   */
  static async updateInvoice(id, input) {
    const invoice = await prisma.invoice.findUnique({ where: { id, isActive: true } });
    if (!invoice) {
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

    const updateData = { ...input };

    if (input.items || input.taxRate !== undefined) {
      const items = input.items || invoice.items;
      let subtotal = 0;
      const formattedItems = (items || []).map((item) => {
        const qty = Number(item.quantity || 1);
        const rate = Number(item.rate || 0);
        const amount = qty * rate;
        subtotal += amount;
        return { ...item, quantity: qty, rate, amount };
      });

      const taxRate = input.taxRate !== undefined ? Number(input.taxRate) : Number(invoice.taxRate);
      const taxAmount = (subtotal * taxRate) / 100;
      const grandTotal = subtotal + taxAmount;

      updateData.items = formattedItems;
      updateData.subtotal = subtotal;
      updateData.taxAmount = taxAmount;
      updateData.grandTotal = grandTotal;
      updateData.taxRate = taxRate;
    }

    if (input.issueDate) updateData.issueDate = new Date(input.issueDate);
    if (input.dueDate) updateData.dueDate = new Date(input.dueDate);

    const updated = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: { customer: true },
    });

    return updated;
  }

  /**
   * Delete invoice
   */
  static async deleteInvoice(id) {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.invoice.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Invoice deleted successfully' };
  }
}

export default InvoiceService;
