// routes/favorites.js
const express = require('express');
const {
  getFavorites,
  getMyFavorites,
  addFavorite,
  removeFavorite,
  updateFavorite,
  getFavoriteTags,
  checkFavorite,
  getFavoriteCount
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(protect);

router
  .route('/')
  .get(getFavorites)
  .post(addFavorite);

router
  .route('/:id')
  .put(updateFavorite)
  .delete(removeFavorite);

router
  .route('/tags')
  .get(getFavoriteTags);

router
  .route('/my')
  .get(getMyFavorites);

router
  .route('/check/:adId')
  .get(checkFavorite);

router
  .route('/count/:adId')
  .get(getFavoriteCount);

module.exports = router;