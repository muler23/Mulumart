import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/Auth/PrivateRoute';
import AdminRoute from './components/Auth/AdminRoute';

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
import ForgotPassword from './pages/Auth/ForgotPassword.jsx';
import ResetPassword from './pages/Auth/ResetPassword.jsx';
import AdsList from './pages/Ads/AdsList.jsx';
import AdDetail from './pages/Ads/AdDetail.jsx';
import CreateAd from './pages/Ads/CreateAd.jsx';
import EditAd from './pages/Ads/EditAd.jsx';
import PromoteAds from './pages/Ads/PromoteAds.jsx';
import Profile from './pages/Profile/Profile.jsx';
import Favorites from './pages/Favorites/Favorites.jsx';
import Messages from './pages/Messages/Messages.jsx';
import Chat from './pages/Messages/Chat.jsx';
import Reviews from './pages/Reviews/Reviews.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import AdminUsers from './pages/Admin/AdminUsers.jsx';
import AdminAds from './pages/Admin/AdminAds.jsx';
import AdminAnalytics from './pages/Admin/AdminAnalytics.jsx';
import UserDashboard from './pages/Dashboard/UserDashboard.jsx';
import BusinessDashboard from './pages/Dashboard/BusinessDashboard.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import PaymentCancel from './pages/PaymentCancel.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/ads" element={<AdsList />} />
          <Route path="/ads/:id" element={<AdDetail />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Private Routes */}
          <Route path="/create-ad" element={<PrivateRoute><CreateAd /></PrivateRoute>} />
          <Route path="/edit-ad/:id" element={<PrivateRoute><EditAd /></PrivateRoute>} />
          <Route path="/promote" element={<PrivateRoute><PromoteAds /></PrivateRoute>} />
          <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/chat/:userId/:adId" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/reviews" element={<PrivateRoute><Reviews /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          
          {/* Dashboard Routes - Role-based */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                {user?.role === 'admin' ? <AdminDashboard /> : 
                 user?.role === 'business' ? <BusinessDashboard /> : 
                 <UserDashboard />}
              </PrivateRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/ads" element={<AdminRoute><AdminAds /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
          
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
