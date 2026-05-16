# Mulu-Mart Frontend

A modern React frontend for the Mulu-Mart marketplace application.

## Features

- **User Authentication**: Login, register, password reset with role-based access
- **Ad Management**: Create, edit, delete, and manage ads with image uploads
- **Real-time Chat**: Socket.io powered messaging between buyers and sellers
- **Favorites**: Save and manage favorite ads
- **Search & Filters**: Advanced search with category, location, and price filters
- **Admin Panel**: Complete admin dashboard for managing users and ads
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Notifications**: Live updates for messages and activities

## Tech Stack

- **React 18**: Modern React with hooks and functional components
- **React Router v6**: Client-side routing
- **React Query**: Server state management and caching
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Beautiful SVG icons
- **React Hook Form**: Form handling with validation
- **Socket.io Client**: Real-time communication
- **Axios**: HTTP client with interceptors
- **React Hot Toast**: Beautiful toast notifications

## Project Structure

```
src/
├── components/
│   ├── Auth/           # Authentication components
│   ├── Layout/         # Layout components
│   ├── UI/             # Reusable UI components
│   └── ...
├── contexts/           # React contexts
├── hooks/             # Custom hooks
├── pages/             # Page components
│   ├── Admin/         # Admin pages
│   ├── Ads/           # Ad-related pages
│   ├── Auth/          # Authentication pages
│   ├── Profile/       # User profile pages
│   └── ...
├── services/          # API services
├── utils/             # Utility functions
└── styles/            # Global styles
```

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- Backend API server running (http://localhost:5000)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mulu-mart-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run eject` - Eject from Create React App

## Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `REACT_APP_SOCKET_URL` | Socket.io server URL | `http://localhost:5000` |

## Key Features

### Authentication
- JWT-based authentication
- Role-based access control (user, business, admin)
- Email verification
- Password reset functionality

### Ad Management
- Create ads with multiple images
- Edit and delete own ads
- Promotion tiers (Bronze, Silver, Gold)
- Ad expiration tracking
- Search and filtering

### Real-time Chat
- Socket.io powered messaging
- Typing indicators
- Read receipts
- Message history

### Admin Panel
- User management
- Ad moderation
- Analytics dashboard
- System notifications

## API Integration

The frontend integrates with a RESTful API for:
- Authentication (`/api/auth`)
- Ads (`/api/ads`)
- Users (`/api/users`)
- Messages (`/api/messages`)
- Categories (`/api/categories`)
- Admin endpoints (`/api/admin`)

## State Management

- **React Query**: Server state, caching, and synchronization
- **Context API**: Global state for auth and socket
- **Local State**: Component-level state with hooks

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Custom Components**: Reusable UI components
- **Dark Mode**: Ready for dark mode implementation

## Performance

- Code splitting with React.lazy
- Image optimization
- Infinite scrolling for large lists
- Debounced search
- Caching with React Query

## Security

- XSS protection
- CSRF protection
- Input validation
- Secure file uploads
- Rate limiting

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

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
