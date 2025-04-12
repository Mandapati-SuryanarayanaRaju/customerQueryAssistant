import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import ChatBox from './ChatBox';
import About from './About';
import Navbar from './Navbar';
import AdminPanel from './pages/AdminPanel';
import { jwtDecode } from 'jwt-decode';

function App() {
  const token = localStorage.getItem('token');
  let role = null;
  let isAuthenticated = false;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);

      if (decoded.exp && decoded.exp > now) {
        role = decoded.role;
        isAuthenticated = true;
      } else {
        console.warn("⚠️ Token expired");
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error("❌ Invalid token:", err);
      localStorage.removeItem('token');
    }
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? (role === 'admin' ? "/admin" : "/chat") : "/login"} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/chat" element={isAuthenticated ? <ChatBox /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isAuthenticated && role === 'admin' ? <AdminPanel /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
