// routes/search.js
const express = require('express');
const {
  searchAds,
  getSearchSuggestions,
  getPopularSearches
} = require('../controllers/searchController');

const router = express.Router();

router
  .route('/')
  .get(searchAds);

router
  .route('/suggestions')
  .get(getSearchSuggestions);

router
  .route('/popular')
  .get(getPopularSearches);

module.exports = router;