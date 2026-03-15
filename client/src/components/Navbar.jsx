import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Library, Sun, Moon } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
    const { user, logout, isAdmin, isAuthor } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon"><Library size={24} /></span>
                    <span className="brand-text">BookLibrary</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/" className="nav-link">Browse</Link>
                    {user && <Link to="/wishlist" className="nav-link">Wishlist</Link>}
                    {user && <Link to="/rentals" className="nav-link">My Rentals</Link>}
                    {user && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
                    {(isAuthor || isAdmin) && <Link to="/books/new" className="nav-link nav-add-book">+ Add Book</Link>}
                    {isAdmin && <Link to="/admin" className="nav-link nav-admin">Admin</Link>}
                </div>

                <div className="navbar-actions">
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        aria-label="Toggle theme"
                    >
                        <span className={`theme-toggle-track ${isDark ? '' : 'light'}`}>
                            <span className="theme-toggle-thumb">
                                {isDark ? <Moon size={14} /> : <Sun size={14} />}
                            </span>
                        </span>
                    </button>

                    {user ? (
                        <div className="user-menu">
                            {user.avatar_url || user.photo_url ? (
                                <img src={`http://localhost:5000/${user.avatar_url || user.photo_url}`} alt={user.name} className="user-avatar" style={{ objectFit: 'cover', padding: 0 }} />
                            ) : (
                                <span className="user-avatar">{user.name?.[0]?.toUpperCase() || 'U'}</span>
                            )}
                            <span className="user-name">{user.name}</span>
                            <span className={`role-badge badge badge-${user.role === 'admin' ? 'danger' : user.role === 'author' ? 'accent' : 'info'}`}>
                                {user.role}
                            </span>
                            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
                        </div>
                    ) : (
                        <div className="auth-links">
                            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
