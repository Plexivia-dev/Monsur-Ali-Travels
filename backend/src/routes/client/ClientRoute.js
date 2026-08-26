import { Router } from 'express';
import ClientController from '../../controllers/client/ClientController.js';

const clientRouter = Router();

// Lookup endpoint for fast autocomplete across forms
// GET /api/v1/clients/lookup?query=...
clientRouter.get('/lookup', (req, res) => {
  ClientController.lookup(req, res);
});

// Full CRUD
clientRouter.get('/', (req, res) => {
  ClientController.getAll(req, res);
});

clientRouter.post('/', (req, res) => {
  ClientController.create(req, res);
});

clientRouter.get('/:id', (req, res) => {
  ClientController.getById(req, res);
});

clientRouter.put('/:id', (req, res) => {
  ClientController.update(req, res);
});

clientRouter.patch('/:id/status', (req, res) => {
  ClientController.updateStatus(req, res);
});

clientRouter.patch('/:id', (req, res) => {
  ClientController.update(req, res);
});

clientRouter.delete('/:id', (req, res) => {
  ClientController.delete(req, res);
});

export default clientRouter;
