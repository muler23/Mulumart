const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  updateReport,
  getReportStatistics,
  getTopReportedItems
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

// Protect all report routes
router.use(protect);

// @route   POST /api/v1/reports
router.post('/', createReport);

// @route   GET /api/v1/reports
router.get('/', getReports);

// @route   GET /api/v1/reports/statistics
router.get('/statistics', getReportStatistics);

// @route   GET /api/v1/reports/top-reported
router.get('/top-reported', getTopReportedItems);

// @route   PUT /api/v1/reports/:id
router.put('/:id', updateReport);

module.exports = router;
