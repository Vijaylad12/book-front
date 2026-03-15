import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Library, CheckCircle, XCircle, Clock, PenLine, Package, Star, BookOpen, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useToast } from '../../components/Toast';
import StarRating from '../../components/StarRating';
import './Dashboard.css';

export default function UserDashboard() {
    const { user } = useAuth();
    const toast = useToast();
    const [rentals, setRentals] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [authorApp, setAuthorApp] = useState(null);
    const [myBooks, setMyBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [applyForm, setApplyForm] = useState({ bio: '', qualifications: '', experience: '' });
    const [photoFile, setPhotoFile] = useState(null);
    const [manuscriptFile, setManuscriptFile] = useState(null);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: user?.name || '' });
    const [profilePhotoFile, setProfilePhotoFile] = useState(null);

    useEffect(() => {
        const fetches = [
            api.get('/rentals/my').then(r => setRentals(r.data.data || [])).catch(() => { }),
            api.get('/ratings/my').then(r => setReviews(r.data.data || [])).catch(() => { }),
            api.get('/wishlists').then(r => setWishlist(r.data.data || [])).catch(() => { }),
            api.get('/admin/author/application').then(r => setAuthorApp(r.data.data)).catch(() => { }),
        ];
        if (user?.role === 'author') {
            fetches.push(api.get('/books/my').then(r => setMyBooks(r.data.data || [])).catch(() => { }));
        }
        Promise.all(fetches).finally(() => setLoading(false));
    }, []);

    const applyAsAuthor = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('bio', applyForm.bio);
            formData.append('qualifications', applyForm.qualifications);
            formData.append('experience', applyForm.experience);
            if (photoFile) {
                formData.append('photo', photoFile);
            }
            if (manuscriptFile) {
                formData.append('manuscript', manuscriptFile);
            }

            await api.post('/admin/author/apply', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowApplyForm(false);
            setPhotoFile(null);
            setManuscriptFile(null);
            toast.success('Application submitted successfully!');
            const r = await api.get('/admin/author/application');
            setAuthorApp(r.data.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit application.');
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', profileForm.name);
            if (profilePhotoFile) {
                formData.append('photo', profilePhotoFile);
            }
            await api.put('/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Profile updated successfully!');
            setIsEditingProfile(false);
            window.location.reload(); // Quick way to refresh context
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile.');
        }
    };

    if (loading) return <div className="page container"><div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner"></div></div></div>;

    const activeRentals = rentals.filter(r => r.status !== 'completed');
    const pastRentals = rentals.filter(r => r.status === 'completed');

    return (
        <div className="page">
            <div className="container">
                <div className="dashboard-header fade-in-up">
                    {user?.avatar_url || user?.photo_url ? (
                        <img src={`http://localhost:5000/${user?.avatar_url || user?.photo_url}`} alt="Profile" className="dashboard-avatar" style={{ objectFit: 'cover' }} />
                    ) : (
                        <div className="dashboard-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                    )}
                    <div style={{ flex: 1 }}>
                        <h1>Welcome, {user?.name}!</h1>
                        <p className="subtitle">Your personal library dashboard</p>
                    </div>
                    <div>
                        <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingProfile(!isEditingProfile)}>
                            <PenLine size={16} style={{ marginRight: 6 }} /> Edit Profile
                        </button>
                    </div>
                </div>

                {isEditingProfile && (
                    <div className="dashboard-section card fade-in-up" style={{ marginBottom: 36 }}>
                        <h2>Edit Profile</h2>
                        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" className="form-input" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Profile Photo</label>
                                <input type="file" className="form-input" accept="image/*" onChange={e => setProfilePhotoFile(e.target.files[0])} />
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Stats */}
                <div className="dashboard-stats fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-card">
                        <div className="stat-value">{activeRentals.length}</div>
                        <div className="stat-label">Active Rentals</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{pastRentals.length}</div>
                        <div className="stat-label">Books Read</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{wishlist.length}</div>
                        <div className="stat-label">Wishlisted</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{reviews.length}</div>
                        <div className="stat-label">Reviews</div>
                    </div>
                    {user?.role === 'author' && (
                        <div className="stat-card">
                            <div className="stat-value">{myBooks.length}</div>
                            <div className="stat-label">My Books</div>
                        </div>
                    )}
                </div>

                {/* My Books (Author only) */}
                {user?.role === 'author' && (
                    <div className="dashboard-section fade-in-up" style={{ animationDelay: '0.15s' }}>
                        <h2><Library size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} /> My Books</h2>
                        {myBooks.length === 0 ? (
                            <p className="text-muted">You haven't submitted any books yet.</p>
                        ) : (
                            <div className="dashboard-list">
                                {myBooks.map(b => (
                                    <div key={b.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                {b.status === 'approved' ? (
                                                    <Link to={`/books/${b.id}`} style={{ fontWeight: 600 }}>{b.title}</Link>
                                                ) : (
                                                    <span style={{ fontWeight: 600 }}>{b.title}</span>
                                                )}
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.genre}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                <span title="Reads"><BookOpen size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {b.read_count || 0} reads</span>
                                                <span title="Rentals"><Package size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {b.rental_count || 0} rentals</span>
                                                <span title="Rating"><Star size={12} style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--warning)' }} /> {parseFloat(b.average_rating || 0).toFixed(1)} ({b.review_count || 0} reviews)</span>
                                            </div>
                                        </div>
                                        {b.status === 'pending' && (
                                            <Link to={`/books/${b.id}/edit`} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Edit</Link>
                                        )}
                                        <span className={`badge badge-${b.status === 'approved' ? 'success' : b.status === 'rejected' ? 'danger' : 'warning'}`}>
                                            {b.status === 'approved' ? <><CheckCircle size={13} /> Approved</> : b.status === 'rejected' ? <><XCircle size={13} /> Rejected</> : <><Clock size={13} /> Pending</>}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Author Application */}
                {user?.role === 'user' && (
                    <div className="dashboard-section fade-in-up" style={{ animationDelay: '0.15s' }}>
                        <h2><PenLine size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Become an Author</h2>
                        {authorApp ? (
                            <div className="card">
                                <p>Application Status: <span className={`badge badge-${authorApp.status === 'approved' ? 'success' : authorApp.status === 'rejected' ? 'danger' : 'warning'}`}>{authorApp.status}</span></p>
                            </div>
                        ) : showApplyForm ? (
                            <form className="card" onSubmit={applyAsAuthor}>
                                <div className="form-group"><label>Bio</label><textarea className="form-input" value={applyForm.bio} onChange={e => setApplyForm({ ...applyForm, bio: e.target.value })} required /></div>
                                <div className="form-group"><label>Qualifications</label><input className="form-input" value={applyForm.qualifications} onChange={e => setApplyForm({ ...applyForm, qualifications: e.target.value })} required /></div>
                                <div className="form-group"><label>Experience</label><textarea className="form-input" value={applyForm.experience} onChange={e => setApplyForm({ ...applyForm, experience: e.target.value })} required /></div>
                                <div className="form-group"><label>Profile Photo (Optional)</label><input type="file" className="form-input" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} /></div>
                                <div className="form-group"><label>Sample Manuscript (PDF)</label><input type="file" className="form-input" accept=".pdf" onChange={e => setManuscriptFile(e.target.files[0])} required /></div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button className="btn btn-primary" type="submit">Submit Application</button>
                                    <button className="btn btn-secondary" type="button" onClick={() => { setShowApplyForm(false); setPhotoFile(null); setManuscriptFile(null); }}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <button className="btn btn-primary" onClick={() => setShowApplyForm(true)}>Apply to Become an Author</button>
                        )}
                    </div>
                )}

                {/* Active Rentals */}
                <div className="dashboard-section fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <h2><Package size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Active Rentals</h2>
                    {activeRentals.length === 0 ? (
                        <p className="text-muted">No active rentals</p>
                    ) : (
                        <div className="dashboard-list">
                            {activeRentals.map(r => (
                                <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <Link to={`/books/${r.book_id}`} style={{ fontWeight: 600, flex: 1 }}>{r.book_title}</Link>
                                    <span className={`badge badge-${r.status === 'dispatched' ? 'warning' : r.status === 'confirmed' ? 'accent' : 'info'}`}>{r.status}</span>
                                    {r.due_date && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due: {new Date(r.due_date).toLocaleDateString()}</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Reviews */}
                <div className="dashboard-section fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <h2><Star size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} /> My Reviews</h2>
                    {reviews.length === 0 ? (
                        <p className="text-muted">No reviews yet</p>
                    ) : (
                        <div className="dashboard-list">
                            {reviews.slice(0, 5).map(r => (
                                <div key={r.id} className="card">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Link to={`/books/${r.book_id}`} style={{ fontWeight: 600 }}>{r.book_title}</Link>
                                        <StarRating rating={r.stars} size="0.85rem" />
                                    </div>
                                    {r.review_text && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{r.review_text}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
