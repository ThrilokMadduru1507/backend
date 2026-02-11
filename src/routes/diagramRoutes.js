const express = require('express');
const router = express.Router();
const {
  getDiagramsByFunction,
  getDiagramById,
  createDiagram,
  updateDiagram,
  deleteDiagram,
  saveDiagramContent
} = require('../controllers/diagramController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Function-level routes
router.get('/function/:functionId', getDiagramsByFunction);
router.post('/function/:functionId', createDiagram);

// Diagram-specific routes
router.get('/:id', getDiagramById);
router.put('/:id', updateDiagram);
router.delete('/:id', deleteDiagram);
router.post('/:id/content', saveDiagramContent);

module.exports = router;