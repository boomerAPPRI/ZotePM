import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import LoginCallback from './pages/LoginCallback';
import MarketDetail from './pages/MarketDetail';
import Dashboard from './pages/Dashboard';

import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="login/callback" element={<LoginCallback />} />
          <Route path="markets/:id" element={<MarketDetail />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
