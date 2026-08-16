import { Router } from 'express';
import CustomerController from '../controllers/CustomerController.js';

const customerRouter = Router();

// Lookup endpoint for fast autocomplete across forms
// GET /api/v1/customers/lookup?query=...
customerRouter.get('/lookup', (req, res) => {
  CustomerController.lookup(req, res);
});

// Full CRUD
customerRouter.get('/', (req, res) => {
  CustomerController.getAll(req, res);
});

customerRouter.post('/', (req, res) => {
  CustomerController.create(req, res);
});

customerRouter.get('/:id', (req, res) => {
  CustomerController.getById(req, res);
});

customerRouter.put('/:id', (req, res) => {
  CustomerController.update(req, res);
});

customerRouter.delete('/:id', (req, res) => {
  CustomerController.delete(req, res);
});

export default customerRouter;
