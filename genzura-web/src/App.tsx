import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import Dashboard      from './pages/Dashboard';
import CasesPage      from './pages/CasesPage';
import ClientsPage    from './pages/ClientsPage';
import AnalyticsPage  from './pages/AnalyticsPage';
import SettingsPage   from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"           element={<LandingPage />}   />
        <Route path="/login"      element={<LoginPage />}     />
        <Route path="/register"   element={<RegisterPage />}  />
        <Route path="/dashboard"  element={<Dashboard />}     />
        <Route path="/cases"      element={<CasesPage />}     />
        <Route path="/clients"    element={<ClientsPage />}   />
        <Route path="/analytics"  element={<AnalyticsPage />} />
        <Route path="/settings"   element={<SettingsPage />}  />
      </Routes>
    </Router>
  );
}

export default App;
