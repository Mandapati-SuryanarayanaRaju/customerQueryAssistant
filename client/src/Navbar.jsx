import { Link, useNavigate } from 'react-router-dom';
import { getUserRole } from './utils/decodeToken';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const role = getUserRole();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="p-4 bg-blue-600 text-white flex justify-between items-center">
      <div className="font-bold text-lg">🤖 CustomerQueryAssistant</div>
      <div className="space-x-4">
        {isLoggedIn && <Link to="/chat">Chat</Link>}
        {role === 'admin' && <Link to="/admin">Admin</Link>}
        <Link to="/about">About</Link>
        {!isLoggedIn ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <button onClick={handleLogout} className="bg-white text-blue-600 px-3 py-1 rounded">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
