const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Favorite must belong to a user'],
    },
    ad: {
      type: mongoose.Schema.ObjectId,
      ref: 'Ad',
      required: [true, 'Favorite must be associated with an ad'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to ensure a user can only favorite an ad once
favoriteSchema.index({ user: 1, ad: 1 }, { unique: true });

// Populate ad and user when finding favorites (temporarily disabled)
// favoriteSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'ad',
//     select: 'title price images location condition status expiresAt',
//     populate: [
//       {
//         path: 'postedBy',
//         select: 'name rating ratingCount',
//       },
//       {
//         path: 'location',
//         select: 'name',
//       },
//     ],
//   });
//   next();
// });

// Static method to get user's favorite ads with pagination
favoriteSchema.statics.getUserFavorites = function (userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ user: userId })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);
};

// Static method to check if an ad is in user's favorites
favoriteSchema.statics.isFavorite = async function (userId, adId) {
  const count = await this.countDocuments({ user: userId, ad: adId });
  return count > 0;
};

// Static method to get favorite count for an ad
favoriteSchema.statics.getFavoriteCount = function (adId) {
  return this.countDocuments({ ad: adId });
};

// Update ad's favorite count when a favorite is saved
favoriteSchema.post('save', async function (doc) {
  await mongoose.model('Ad').updateOne(
    { _id: doc.ad },
    { $inc: { favoriteCount: 1 } }
  );
});

// Update ad's favorite count when a favorite is removed
favoriteSchema.post('remove', async function (doc) {
  await mongoose.model('Ad').updateOne(
    { _id: doc.ad },
    { $inc: { favoriteCount: -1 } }
  );
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
