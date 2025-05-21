import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Browse from './pages/Browse'
import MovieDetails from './pages/MovieDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import SubscriptionPlans from './pages/SubscriptionPlans'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AdminDashboard from './pages/AdminDashboard'
import AdminSubscriptions from './pages/AdminSubscriptions'
import AdminSubscriptionPlans from './pages/AdminSubscriptionPlans'
import AdminUsers from './pages/AdminUsers'
import MovieForm from './pages/MovieForm'
import './index.css'
import './App.css'
import './styles/admin.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Navbar />
          <main>
            <div className="container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/subscriptions" element={<SubscriptionPlans />} />
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
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </div>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
