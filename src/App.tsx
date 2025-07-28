import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QuoteProvider } from './contexts/QuoteContext';
import { CategoryProvider } from './contexts/CategoryContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicQuote } from './pages/PublicQuote';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <CategoryProvider>
        <QuoteProvider>
          <Router>
            <Routes>
              <Route path="/" element={<PublicQuote />} />
              <Route path="/login" element={<AdminLogin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </QuoteProvider>
      </CategoryProvider>
    </AuthProvider>
  );
}

export default App;