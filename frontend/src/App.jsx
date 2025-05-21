import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import MainNavbar from './components/MainNavbar'
import CinematicFooter from './components/CinematicFooter'
import CinematicBackground from './components/CinematicBackground'
import Home from './pages/Home'
import Browse from './pages/Browse'
import MovieDetails from './pages/MovieDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import SubscriptionPlans from './pages/SubscriptionPlans'
import NotFound from './pages/NotFound'
import PaymentPage from './pages/PaymentPage'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailure from './pages/PaymentFailure'
import PaymentReceipt from './pages/PaymentReceipt'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AdminDashboard from './pages/AdminDashboard'
import AdminSubscriptions from './pages/AdminSubscriptions'
import AdminSubscriptionPlans from './pages/AdminSubscriptionPlans'
import AdminUsers from './pages/AdminUsers'
import AdminPayments from './pages/AdminPayments'
import MovieForm from './pages/MovieForm'

// Import CSS
import './index.css'
import './App.css'
import './styles/admin.css'
import './styles/buttons.css'
import './styles/table.css'
import './styles/admin-dashboard.css'
import './styles/toast.css'
import './styles/browse.css'
import './styles/movie-card.css'
import './styles/home-skeleton.css'
import './styles/auth.css'
import './styles/cinematic.css'
import './styles/cinematic-profile.css'
import './styles/cinematic-player.css'
import './styles/cinematic-admin.css'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div>
            <MainNavbar />
            <CinematicBackground opacity="low" />
            <main className="cinematic-content">
              <div className="container">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/movie/:id" element={<MovieDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/subscriptions" element={<SubscriptionPlans />} />
                <Route
                  path="/payment/:planId"
                  element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/failure" element={<PaymentFailure />} />
                <Route
                  path="/payment/:paymentId/receipt"
                  element={
                    <ProtectedRoute>
                      <PaymentReceipt />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/movies/add"
                  element={
                    <AdminRoute>
                      <MovieForm />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/movies/edit/:id"
                  element={
                    <AdminRoute>
                      <MovieForm />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/subscriptions"
                  element={
                    <AdminRoute>
                      <AdminSubscriptions />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/subscription-plans"
                  element={
                    <AdminRoute>
                      <AdminSubscriptionPlans />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <AdminUsers />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/payments"
                  element={
                    <AdminRoute>
                      <AdminPayments />
                    </AdminRoute>
                  }
                />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </div>
          </main>
          <CinematicFooter />
          <ToastContainer />
        </div>
      </Router>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
