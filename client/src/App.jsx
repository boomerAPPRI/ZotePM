import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import LoginCallback from './pages/LoginCallback';
import MarketDetail from './pages/MarketDetail';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Challenges from './pages/Challenges';
import ChallengeDetail from './pages/ChallengeDetail';
import FeedbackWidget from './components/FeedbackWidget';
import HowToPlayWidget from './components/HowToPlayWidget';
import HowToPlay from './pages/HowToPlay';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/callback" element={<LoginCallback />} />
            <Route path="/markets/:id" element={<MarketDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/challenges/:id" element={<ChallengeDetail />} />
            <Route path="/how-to-play" element={<HowToPlay />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Routes>
          <FeedbackWidget />
          {import.meta.env.MODE === 'superbowl' && <HowToPlayWidget />}

          <footer className="bg-transparent border-t-0 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} {import.meta.env.VITE_APP_TITLE || 'Boom Creator'}. All rights reserved.
                <span className="text-xs text-gray-400 block mt-1">Powered by ZotePM</span>
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
