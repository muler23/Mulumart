# Mulu-Mart API

A complete backend API for a marketplace platform built with the MERN stack (MongoDB, Express, Node.js). Features include user authentication, ad management, real-time messaging, reviews, promotions, and admin analytics.

## Features

### Core Features
- **User Authentication**: Register, login, email verification, password reset
- **Role-based Access**: USER, BUSINESS, and ADMIN roles
- **Ad Management**: Create, update, delete, and manage ads with images
- **Advanced Search**: Filter by category, location, price range, keywords
- **Real-time Chat**: Socket.io powered messaging between buyers and sellers
- **Reviews & Ratings**: Seller ratings and review system
- **Favorites/Watchlist**: Save ads to personal favorites
- **Promotions**: Tiered promotion system (Bronze, Silver, Gold)
- **Admin Panel**: User management, ad approval, analytics dashboard

### Advanced Features
- **Ad Analytics**: Views, favorites, and inquiry tracking
- **Multi-media Support**: Image uploads via Cloudinary
- **Automatic Ad Expiry**: Ads expire after 30 days
- **Priority Scoring**: Promoted ads ranked higher
- **Email Notifications**: Transactional emails for verification and updates
- **Rate Limiting**: API protection against abuse
- **Security**: XSS protection, MongoDB injection prevention, CORS

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary for image uploads
- **Real-time**: Socket.io for messaging
- **Security**: Helmet, CORS, Rate Limiting, XSS Clean
- **Validation**: Express Validator

## Project Structure

```
src/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── adController.js       # Ad management
│   ├── userController.js     # User management
│   ├── messageController.js  # Messaging system
│   ├── reviewController.js   # Review system
│   ├── promotionController.js # Promotion management
│   ├── favoriteController.js  # Favorites management
│   ├── categoryController.js # Category management
│   └── adminController.js   # Admin functions
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js      # Error handling
│   ├── upload.js            # File upload handling
│   ├── rateLimiter.js       # Rate limiting
│   └── validation.js        # Input validation
├── models/
│   ├── User.js              # User schema
│   ├── Ad.js               # Ad schema
│   ├── Category.js          # Category schema
│   ├── Message.js          # Message schema
│   ├── Conversation.js      # Conversation schema
│   ├── Review.js           # Review schema
│   ├── Favorite.js        # Favorite schema
│   └── Promotion.js       # Promotion schema
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── ads.js            # Ad routes
│   ├── users.js          # User routes
│   ├── messages.js       # Message routes
│   ├── reviews.js        # Review routes
│   ├── promotions.js     # Promotion routes
│   ├── favorites.js      # Favorite routes
│   ├── categories.js     # Category routes
│   └── admin.js         # Admin routes
├── utils/
│   ├── sendEmail.js      # Email service
│   ├── appError.js       # Error handling
│   └── errorResponse.js  # Error responses
└── services/            # Additional services
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mulu-mart-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/mulumart

   # JWT
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30

   # Email Configuration
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=your_mailtrap_user
   EMAIL_PASSWORD=your_mailtrap_password
   EMAIL_FROM=no-reply@mulumart.com

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=15*60*1000
   RATE_LIMIT_MAX=100

   # Ad Configuration
   AD_EXPIRY_DAYS=30

   # Promotion Tiers (in days)
   PROMOTION_BRONZE_DAYS=7
   PROMOTION_SILVER_DAYS=14
   PROMOTION_GOLD_DAYS=30
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/verify-email/:token` - Verify email
- `POST /api/v1/auth/forgotpassword` - Forgot password
- `PUT /api/v1/auth/resetpassword/:token` - Reset password
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/updatedetails` - Update user details
- `PUT /api/v1/auth/updatepassword` - Update password

### Ads
- `GET /api/v1/ads` - Get all ads (with filtering)
- `GET /api/v1/ads/:id` - Get single ad
- `POST /api/v1/ads` - Create new ad
- `PUT /api/v1/ads/:id` - Update ad
- `DELETE /api/v1/ads/:id` - Delete ad
- `GET /api/v1/ads/my` - Get user's ads
- `PUT /api/v1/ads/:id/sold` - Mark ad as sold
- `GET /api/v1/ads/featured` - Get featured ads
- `GET /api/v1/ads/:id/similar` - Get similar ads
- `POST /api/v1/ads/:id/promote` - Promote ad
- `GET /api/v1/ads/:id/analytics` - Get ad analytics

### Categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:id` - Get single category
- `POST /api/v1/categories` - Create category (admin)
- `PUT /api/v1/categories/:id` - Update category (admin)
- `DELETE /api/v1/categories/:id` - Delete category (admin)

### Messages
- `GET /api/v1/messages/conversations` - Get user conversations
- `GET /api/v1/messages/conversations/:id` - Get single conversation
- `GET /api/v1/messages/:adId/:userId` - Get messages between users
- `POST /api/v1/messages` - Send message
- `PUT /api/v1/messages/read` - Mark messages as read
- `DELETE /api/v1/messages/:id` - Delete message
- `GET /api/v1/messages/unread-count` - Get unread count

### Reviews
- `GET /api/v1/reviews` - Get reviews (with filtering)
- `GET /api/v1/reviews/:id` - Get single review
- `POST /api/v1/reviews` - Create review
- `PUT /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review
- `PUT /api/v1/reviews/:id/helpful` - Mark review as helpful

### Favorites
- `GET /api/v1/favorites` - Get user favorites
- `POST /api/v1/favorites` - Add to favorites
- `DELETE /api/v1/favorites/:id` - Remove from favorites
- `GET /api/v1/favorites/check/:adId` - Check if ad is favorited

### Promotions
- `GET /api/v1/promotions/tiers` - Get promotion pricing
- `GET /api/v1/promotions/active` - Get active promotions
- `GET /api/v1/promotions/my` - Get user promotions
- `POST /api/v1/promotions` - Create promotion
- `GET /api/v1/promotions/:id` - Get single promotion
- `PUT /api/v1/promotions/:id/payment` - Update payment status
- `DELETE /api/v1/promotions/:id` - Cancel promotion

### Admin
- `GET /api/v1/admin/analytics` - Get platform analytics
- `GET /api/v1/admin/users` - Get all users
- `PUT /api/v1/admin/users/:id/approve` - Approve user
- `PUT /api/v1/admin/users/:id/ban` - Ban user
- `GET /api/v1/admin/ads` - Get all ads
- `PUT /api/v1/admin/ads/:id/approve` - Approve ad
- `PUT /api/v1/admin/ads/:id/reject` - Reject ad

## Socket.io Events

### Client to Server
- `join` - Join user room
- `sendMessage` - Send new message
- `typing` - User is typing

### Server to Client
- `newMessage` - Receive new message
- `userTyping` - User is typing notification
- `message_{userId}` - Direct message to user

## Data Models

### User
```javascript
{
  name: String,
  email: String,
  password: String,
  role: ['user', 'business', 'admin'],
  phone: String,
  photo: String,
  location: String,
  bio: String,
  emailVerified: Boolean,
  stats: {
    totalAds: Number,
    activeAds: Number,
    soldItems: Number,
    averageRating: Number,
    totalReviews: Number
  }
}
```

### Ad
```javascript
{
  title: String,
  description: String,
  price: Number,
  condition: ['new', 'used', 'refurbished'],
  category: ObjectId,
  location: String,
  images: [{
    url: String,
    publicId: String,
    isPrimary: Boolean
  }],
  postedBy: ObjectId,
  status: ['active', 'sold', 'pending', 'rejected', 'expired'],
  views: Number,
  isPromoted: Boolean,
  promotionTier: ['bronze', 'silver', 'gold'],
  promotionExpiresAt: Date,
  priorityScore: Number,
  expiresAt: Date
}
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

### Environment Setup
1. Set production environment variables
2. Configure MongoDB connection string
3. Set up Cloudinary account
4. Configure email service
5. Set up proper CORS origins

### Build & Deploy
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.

## Roadmap

- [ ] Payment integration (Stripe/PayPal)
- [ ] Mobile app API
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Video support for ads
- [ ] AI-powered recommendations
- [ ] Push notifications
- [ ] Advanced search with filters
- [ ] User verification system
- [ ] Dispute resolution system
