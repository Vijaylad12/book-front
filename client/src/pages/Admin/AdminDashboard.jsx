import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, BarChart3, FilePenLine, Library, PenLine, Star, Package, BookOpen, Heart, Trophy, CheckCircle, XCircle, Eye, Trash2, FileText } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../services/api';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import '../Dashboard/Dashboard.css';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('analytics');
    const [analytics, setAnalytics] = useState(null);
    const [pendingAuthors, setPendingAuthors] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [rentals, setRentals] = useState([]);
    const [books, setBooks] = useState([]);
    const [pendingBooks, setPendingBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null, variant: 'danger' });
    const toast = useToast();

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [a, pa, rv, rt, bk, pb] = await Promise.all([
                api.get('/admin/analytics'),
                api.get('/admin/authors/pending'),
                api.get('/admin/reviews'),
                api.get('/rentals'),
                api.get('/books?limit=100'),
                api.get('/admin/books/pending'),
            ]);
            setAnalytics(a.data.data);
            setPendingAuthors(pa.data.data || []);
            setReviews(rv.data.data || []);
            setRentals(rt.data.data || []);
            setBooks(bk.data.data || []);
            setPendingBooks(pb.data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const showConfirm = (title, message, onConfirm, variant = 'danger') => {
        setConfirmState({ open: true, title, message, onConfirm, variant });
    };

    const closeConfirm = () => {
        setConfirmState({ open: false, title: '', message: '', onConfirm: null, variant: 'danger' });
    };

    const approveAuthor = async (id) => {
        try { await api.put(`/admin/authors/${id}/approve`); toast.success('Author approved!'); fetchAll(); } catch (err) { toast.error('Failed to approve author.'); }
    };
    const rejectAuthor = async (id) => {
        try { await api.put(`/admin/authors/${id}/reject`); toast.success('Author rejected.'); fetchAll(); } catch (err) { toast.error('Failed to reject author.'); }
    };
    const deleteReview = async (id) => {
        showConfirm('Delete Review', 'Are you sure you want to delete this review? This action cannot be undone.', async () => {
            closeConfirm();
            try { await api.delete(`/admin/reviews/${id}`); toast.success('Review deleted.'); fetchAll(); } catch (err) { toast.error('Failed to delete review.'); }
        });
    };
    const [dispatchState, setDispatchState] = useState({ open: false, rentalId: null, dueDate: '' });

    const openDispatch = (id) => {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 14);
        setDispatchState({ open: true, rentalId: id, dueDate: defaultDate });
    };

    const handleDispatch = async () => {
        const { rentalId, dueDate } = dispatchState;
        setDispatchState({ open: false, rentalId: null, dueDate: null });
        try {
            await api.put(`/rentals/${rentalId}/dispatch`, { dueDate: dueDate ? dueDate.toISOString().split('T')[0] : null });
            toast.success('Rental dispatched successfully!');
            fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to dispatch rental.'); }
    };

    const updateRentalStatus = async (id, action) => {
        try { await api.put(`/rentals/${id}/${action}`); toast.success(`Rental ${action}d successfully!`); fetchAll(); } catch (err) { toast.error(err.response?.data?.message || 'Failed to update rental.'); }
    };
    const deleteBook = async (id, title) => {
        showConfirm('Delete Book', `Are you sure you want to delete "${title}"? This action cannot be undone.`, async () => {
            closeConfirm();
            try {
                await api.delete(`/books/${id}`);
                toast.success(`"${title}" has been deleted.`);
                fetchAll();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to delete book.');
            }
        });
    };
    const approveBook = async (id) => {
        try { await api.put(`/admin/books/${id}/approve`); toast.success('Book approved!'); fetchAll(); } catch (err) { toast.error(err.response?.data?.message || 'Failed to approve book.'); }
    };
    const rejectBook = async (id) => {
        showConfirm('Reject Book', 'Are you sure you want to reject this book submission?', async () => {
            closeConfirm();
            try { await api.put(`/admin/books/${id}/reject`); toast.success('Book rejected.'); fetchAll(); } catch (err) { toast.error(err.response?.data?.message || 'Failed to reject book.'); }
        });
    };

    const handleViewManuscript = (authorId) => {
        navigate(`/admin/authors/${authorId}/manuscript`);
    };

    if (loading) return <div className="loader"><div className="spinner"></div></div>;

    const tabs = [
        { id: 'analytics', icon: <BarChart3 size={15} />, label: 'Analytics' },
        { id: 'submissions', icon: <FilePenLine size={15} />, label: `Submissions (${pendingBooks.length})` },
        { id: 'books', icon: <Library size={15} />, label: `Books (${books.length})` },
        { id: 'authors', icon: <PenLine size={15} />, label: `Authors (${pendingAuthors.length})` },
        { id: 'reviews', icon: <Star size={15} />, label: `Reviews (${reviews.length})` },
        { id: 'rentals', icon: <Package size={15} />, label: `Rentals (${rentals.length})` },
    ];

    const analyticsHeadings = {
        mostRead: { icon: <BookOpen size={18} />, label: 'Most Read' },
        mostRented: { icon: <Package size={18} />, label: 'Most Rented' },
        mostWishlisted: { icon: <Heart size={18} />, label: 'Most Wishlisted' },
        highestRated: { icon: <Star size={18} />, label: 'Highest Rated' },
    };

    return (
        <div className="page">
            <div className="container">
                <div className="section-header fade-in-up">
                    <div>
                        <h2><Shield size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Admin Dashboard</h2>
                        <p className="subtitle">Manage your library</p>
                    </div>
                </div>

                <div className="admin-tabs fade-in-up">
                    {tabs.map(t => (
                        <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* Analytics Tab */}
                {tab === 'analytics' && analytics && (
                    <div className="fade-in-up">
                        <div className="admin-grid">
                            <div className="stat-card"><div className="stat-value">{analytics.overview.totalUsers}</div><div className="stat-label">Total Users</div></div>
                            <div className="stat-card"><div className="stat-value">{analytics.overview.totalAuthors}</div><div className="stat-label">Authors</div></div>
                            <div className="stat-card"><div className="stat-value">{analytics.overview.totalBooks}</div><div className="stat-label">Books</div></div>
                            <div className="stat-card"><div className="stat-value">{analytics.overview.activeRentals}</div><div className="stat-label">Active Rentals</div></div>
                            <div className="stat-card"><div className="stat-value" style={{ color: analytics.overview.overdueRentals > 0 ? 'var(--danger)' : undefined }}>{analytics.overview.overdueRentals}</div><div className="stat-label">Overdue</div></div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            {['mostRead', 'mostRented', 'mostWishlisted', 'highestRated'].map(key => (
                                <div key={key} className="analytics-section">
                                    <h3>{analyticsHeadings[key].icon} {analyticsHeadings[key].label}</h3>
                                    <div className="analytics-list">
                                        {analytics.bookAnalytics[key]?.map((b, i) => (
                                            <div key={b.id} className="analytics-item">
                                                <span><span className="rank">#{i + 1}</span> <Link to={`/books/${b.id}`}>{b.title}</Link></span>
                                                <span style={{ fontWeight: 600, color: 'var(--accent-light)' }}>
                                                    {b.read_count ?? b.rental_count ?? b.wishlist_count ?? (b.average_rating ? `${parseFloat(b.average_rating).toFixed(1)}★` : '')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {analytics.authorInsights?.length > 0 && (
                            <div className="analytics-section">
                                <h3><Trophy size={18} /> Top Authors</h3>
                                <div className="table-wrapper">
                                    <table>
                                        <thead><tr><th>Author</th><th>Books</th><th>Reads</th><th>Rentals</th><th>Avg Rating</th></tr></thead>
                                        <tbody>
                                            {analytics.authorInsights.map(a => (
                                                <tr key={a.id}><td>{a.name}</td><td>{a.book_count}</td><td>{a.total_reads}</td><td>{a.total_rentals}</td><td>{parseFloat(a.avg_rating).toFixed(1)}★</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Submissions Tab */}
                {tab === 'submissions' && (
                    <div className="fade-in-up">
                        {pendingBooks.length === 0 ? (
                            <div className="empty-state"><div className="empty-icon"><CheckCircle size={48} /></div><h3>No pending submissions</h3></div>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Author</th>
                                            <th>Genre</th>
                                            <th>ISBN</th>
                                            <th>Submitted</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingBooks.map(b => (
                                            <tr key={b.id}>
                                                <td>{b.title}</td>
                                                <td>{b.author_name || '—'}</td>
                                                <td>{b.genre || '—'}</td>
                                                <td>{b.isbn || '—'}</td>
                                                <td>{new Date(b.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <Link to={`/books/${b.id}`} className="btn btn-secondary btn-sm"><Eye size={14} /> Preview</Link>
                                                        <button className="btn btn-primary btn-sm" onClick={() => approveBook(b.id)}><CheckCircle size={14} /> Approve</button>
                                                        <button className="btn btn-danger btn-sm" onClick={() => rejectBook(b.id)}><XCircle size={14} /> Reject</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Books Tab */}
                {tab === 'books' && (
                    <div className="fade-in-up">
                        {books.length === 0 ? (
                            <div className="empty-state"><div className="empty-icon"><Library size={48} /></div><h3>No books in the library</h3></div>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Author</th>
                                            <th>Genre</th>
                                            <th>Copies</th>
                                            <th>Rating</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {books.map(b => (
                                            <tr key={b.id}>
                                                <td><Link to={`/books/${b.id}`}>{b.title}</Link></td>
                                                <td>{b.author_name || '—'}</td>
                                                <td>{b.genre || '—'}</td>
                                                <td>{b.available_copies}/{b.total_copies}</td>
                                                <td>{b.average_rating ? `${parseFloat(b.average_rating).toFixed(1)}★` : '—'}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => deleteBook(b.id, b.title)}
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Authors Tab */}
                {tab === 'authors' && (
                    <div className="fade-in-up">
                        {pendingAuthors.length === 0 ? (
                            <div className="empty-state"><div className="empty-icon"><CheckCircle size={48} /></div><h3>No pending applications</h3></div>
                        ) : (
                            <div className="dashboard-list">
                                {pendingAuthors.map(a => (
                                    <div key={a.id} className="card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                            <div><h3 style={{ fontSize: '1.1rem', color: 'var(--text-white)' }}>{a.name}</h3><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.email}</p></div>
                                            <span className="badge badge-warning">Pending</span>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8 }}><strong>Bio:</strong> {a.bio}</p>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8 }}><strong>Qualifications:</strong> {a.qualifications}</p>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16 }}><strong>Experience:</strong> {a.experience}</p>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {a.manuscript_url && (
                                                <button
                                                    onClick={() => handleViewManuscript(a.id)}
                                                    className="btn btn-secondary btn-sm"
                                                >
                                                    <FileText size={14} /> View Manuscript
                                                </button>
                                            )}
                                            <button className="btn btn-primary btn-sm" onClick={() => approveAuthor(a.id)}><CheckCircle size={14} /> Approve</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => rejectAuthor(a.id)}><XCircle size={14} /> Reject</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Reviews Tab */}
                {tab === 'reviews' && (
                    <div className="fade-in-up">
                        {reviews.length === 0 ? (
                            <div className="empty-state"><div className="empty-icon"><Star size={48} /></div><h3>No reviews</h3></div>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>User</th><th>Book</th><th>Rating</th><th>Review</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {reviews.map(r => (
                                            <tr key={r.id}>
                                                <td>{r.user_name}</td>
                                                <td><Link to={`/books/${r.book_id}`}>{r.book_title}</Link></td>
                                                <td>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</td>
                                                <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.review_text || '—'}</td>
                                                <td><span className={`badge ${r.is_approved ? 'badge-success' : 'badge-danger'}`}>{r.is_approved ? 'Approved' : 'Hidden'}</span></td>
                                                <td><button className="btn btn-danger btn-sm" onClick={() => deleteReview(r.id)}>Delete</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Rentals Tab */}
                {tab === 'rentals' && (
                    <div className="fade-in-up">
                        <div className="table-wrapper">
                            <table>
                                <thead><tr><th>User</th><th>Book</th><th>Status</th><th>Requested</th><th>Due Date</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {rentals.map(r => (
                                        <tr key={r.id}>
                                            <td>{r.user_name}</td>
                                            <td>{r.book_title}</td>
                                            <td><span className={`badge badge-${r.status === 'completed' ? 'success' : r.status === 'dispatched' ? 'warning' : 'info'}`}>{r.status}</span></td>
                                            <td>{new Date(r.requested_at).toLocaleDateString()}</td>
                                            <td>{r.due_date ? new Date(r.due_date).toLocaleDateString() : '—'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    {r.status === 'requested' && <button className="btn btn-primary btn-sm" onClick={() => updateRentalStatus(r.id, 'confirm')}>Confirm</button>}
                                                    {r.status === 'confirmed' && <button className="btn btn-primary btn-sm" onClick={() => openDispatch(r.id)}>Dispatch</button>}
                                                    {r.status === 'return_initiated' && <button className="btn btn-primary btn-sm" onClick={() => updateRentalStatus(r.id, 'complete')}>Complete</button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                confirmText="Delete"
                variant={confirmState.variant}
                onConfirm={confirmState.onConfirm}
                onCancel={closeConfirm}
            />

            {/* Dispatch Due Date Picker */}
            {dispatchState.open && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: 360, padding: 28 }}>
                        <h3 style={{ marginBottom: 8 }}>Set Due Date</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>Choose the date by which the user must return the book.</p>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Due Date</label>
                        <DatePicker
                            selected={dispatchState.dueDate}
                            onChange={date => setDispatchState(s => ({ ...s, dueDate: date }))}
                            minDate={new Date(Date.now() + 86400000)}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Select a due date"
                            className="input"
                            wrapperClassName="datepicker-full-width"
                            style={{ marginBottom: 20, width: '100%' }}
                        />
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                            <button className="btn btn-secondary" onClick={() => setDispatchState({ open: false, rentalId: null, dueDate: null })}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleDispatch} disabled={!dispatchState.dueDate}>Dispatch</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
