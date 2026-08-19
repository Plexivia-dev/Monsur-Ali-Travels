import { Router } from 'express';
import CustomerController from '../controllers/CustomerController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import {
  createCustomerSchema,
  updateCustomerSchema,
  listCustomersSchema,
  lookupCustomerSchema,
} from '../validations/customer.validation.js';

const customerRouter = Router();

// Lookup route (placed before :id to prevent collision)
customerRouter.get('/lookup', authenticateToken, validate(lookupCustomerSchema), CustomerController.lookupCustomers);

// Central CRUD routes
customerRouter.get('/', authenticateToken, validate(listCustomersSchema), CustomerController.listCustomers);
customerRouter.post('/', authenticateToken, validate(createCustomerSchema), CustomerController.createCustomer);
customerRouter.get('/:id', authenticateToken, CustomerController.getCustomerById);
customerRouter.put('/:id', authenticateToken, validate(updateCustomerSchema), CustomerController.updateCustomer);
customerRouter.delete('/:id', authenticateToken, CustomerController.deleteCustomer);

export default customerRouter;
