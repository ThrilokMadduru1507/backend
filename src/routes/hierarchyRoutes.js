const express = require('express');
const router = express.Router();
const {
  getClientHierarchy,
  getAllClientsWithCompanies
} = require('../controllers/hierarchyController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/clients', getAllClientsWithCompanies);
router.get('/clients/:clientId', getClientHierarchy);

module.exports = router;