const express = require('express');
const {
  getPromotions,
  getPromotion,
  createPromotion,
  updatePaymentStatus,
  cancelPromotion,
  getPromotionTiers,
  getMyPromotions,
  getActivePromotions
} = require('../controllers/promotionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/tiers', getPromotionTiers);
router.get('/active', getActivePromotions);

// Protected routes
router.get('/my', protect, getMyPromotions);
router.post('/', protect, createPromotion);
router.get('/:id', protect, getPromotion);
router.put('/:id/payment', protect, updatePaymentStatus);
router.delete('/:id', protect, cancelPromotion);

// Admin routes
router.get('/', protect, authorize('admin'), getPromotions);

module.exports = router;
