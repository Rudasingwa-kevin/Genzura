import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard      from './pages/Dashboard';
import CasesPage      from './pages/CasesPage';
import CalendarPage   from './pages/CalendarPage';
import DocumentsPage  from './pages/DocumentsPage';
import ClientsPage    from './pages/ClientsPage';
import AnalyticsPage  from './pages/AnalyticsPage';
import SettingsPage   from './pages/SettingsPage';
import CaseDetailPage from './pages/CaseDetailPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"           element={<LandingPage />}   />
          <Route path="/login"      element={<LoginPage />}     />
          <Route path="/register"   element={<RegisterPage />}  />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>}     />
          <Route path="/cases"      element={<ProtectedRoute><CasesPage /></ProtectedRoute>}     />
          <Route path="/cases/:id"  element={<ProtectedRoute><CaseDetailPage /></ProtectedRoute>} />
          <Route path="/calendar"   element={<ProtectedRoute><CalendarPage /></ProtectedRoute>}  />
          <Route path="/documents"  element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
          <Route path="/clients"    element={<ProtectedRoute><ClientsPage /></ProtectedRoute>}   />
          <Route path="/analytics"  element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/settings"   element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}  />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
