// routes/ads.js
const express = require('express');
const router = express.Router();
const { uploadImages } = require('../middleware/upload');
const path = require('path');

const {
  getAds,
  getAd,
  createAd,
  updateAd,
  deleteAd,
  adPhotoUpload,
  uploadImagesPublic,
  setPrimaryImage,
  deleteAdImage,
  getMyAds
} = require('../controllers/adController');

const {
  addFavorite
} = require('../controllers/favoriteController');

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Ad = require('../models/Ad');
const { validate } = require('../middleware/validation');

// @route   POST /api/v1/ads
router
  .route('/')
  .get(getAds)
  .post(protect, validate, uploadImages('images', 3), createAd);

// ======================================================
// @route   GET /api/v1/ads/my-ads
router.route('/my-ads').get(protect, getMyAds);

// ======================================================
// @route   GET /api/v1/ads/my
router.route('/my').get(protect, getMyAds);

// ======================================================
// @route   GET / PUT / DELETE /api/v1/ads/:id
router
  .route('/:id')
  .get(getAd)
  .put(protect, authorize('user', 'admin', 'business'), updateAd)
  .delete(protect, authorize('user', 'admin', 'business'), deleteAd);

// ======================================================
// @route   POST /api/v1/ads/:id/images
router.route('/:id/images').post(uploadImages('images', 10), uploadImagesPublic);

// ======================================================
// @route   PUT /api/v1/ads/:id/primary
router.route('/:id/primary').put(protect, authorize('user', 'admin', 'business'), setPrimaryImage);

// ======================================================
// @route   DELETE /api/v1/ads/:id/images/:imageId
router.route('/:id/images/:imageId').delete(protect, authorize('user', 'business'), deleteAdImage);

// ======================================================
// @route   POST /api/v1/ads/:id/favorites
router.route('/:id/favorites').post(protect, addFavorite);

// ======================================================
module.exports = router;
