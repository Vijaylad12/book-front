import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import './Auth.css';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            return setError('Passwords do not match.');
        }
        if (form.password.length < 6) {
            return setError('Password must be at least 6 characters.');
        }

        setLoading(true);
        try {
            await api.post('/auth/register', {
                name: form.name,
                email: form.email,
                mobile: form.mobile || undefined,
                password: form.password,
            });
            navigate('/verify-otp', { state: { email: form.email } });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container scale-in">
                <div className="auth-header">
                    <span className="auth-icon"><Sparkles size={40} /></span>
                    <h1>Create Account</h1>
                    <p>Join the library community today</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="reg-name">Full Name</label>
                        <input id="reg-name" type="text" className="form-input" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-email">Email</label>
                        <input id="reg-email" type="email" className="form-input" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="reg-mobile">Mobile (optional)</label>
                        <input id="reg-mobile" type="tel" className="form-input" placeholder="9876543210" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="reg-password">Password</label>
                            <div className="password-wrapper">
                                <input id="reg-password" type={showPassword ? 'text' : 'password'} className="form-input" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="reg-confirm">Confirm</label>
                            <div className="password-wrapper">
                                <input id="reg-confirm" type={showConfirm ? 'text' : 'password'} className="form-input" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
                                <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>

            <div className="auth-decoration">
                <div className="deco-circle deco-1"></div>
                <div className="deco-circle deco-2"></div>
            </div>
        </div>
    );
}
