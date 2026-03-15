import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Package, XCircle, Heart, HeartOff } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import StarRating from '../../components/StarRating';
import './Books.css';

export default function BookDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [reviewForm, setReviewForm] = useState({ stars: 0, reviewText: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchBook(); fetchReviews(); checkWishlist(); }, [id]);

    const fetchBook = async () => {
        try {
            const { data } = await api.get(`/books/${id}`);
            setBook(data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchReviews = async () => {
        try {
            const { data } = await api.get(`/ratings/book/${id}`);
            setReviews(data.data || []);
        } catch { /* ignore */ }
    };

    const checkWishlist = async () => {
        if (!user) return;
        try {
            const { data } = await api.get(`/wishlists/check/${id}`);
            setIsWishlisted(data.data?.isInWishlist);
        } catch { /* ignore */ }
    };

    const toggleWishlist = async () => {
        if (!user) return navigate('/login');
        try {
            if (isWishlisted) {
                await api.delete(`/wishlists/${id}`);
            } else {
                await api.post('/wishlists', { bookId: parseInt(id) });
            }
            setIsWishlisted(!isWishlisted);
            fetchBook();
        } catch (err) { console.error(err); }
    };

    const requestRental = async () => {
        if (!user) return navigate('/login');
        try {
            const { data } = await api.post('/payment/create-checkout-session', { bookId: parseInt(id) });
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error("Payment initiation failed:", err);
            if (err.response) {
                console.error("Backend Response:", err.response.data);
                toast.error(err.response?.data?.message || 'Failed to initiate payment.');
            } else {
                toast.error('Network or unknown error occurred.');
            }
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!user) return navigate('/login');
        if (!reviewForm.stars) return toast.warning('Please select a rating.');
        setSubmitting(true);
        try {
            await api.post('/ratings', { bookId: parseInt(id), stars: reviewForm.stars, reviewText: reviewForm.reviewText });
            setReviewForm({ stars: 0, reviewText: '' });
            fetchReviews();
            fetchBook();
            toast.success('Review submitted!');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review.'); }
        finally { setSubmitting(false); }
    };

    if (loading) return <div className="loader"><div className="spinner"></div></div>;
    if (!book) return <div className="empty-state"><h3>Book not found</h3></div>;

    const hasCover = !!book.cover_image_url;

    return (
        <div className="page">
            <div className="container">
                <div className="book-detail fade-in-up">
                    <div className="book-detail-cover">
                        {hasCover ? (
                            <img src={`http://localhost:5000/${book.cover_image_url}`} alt={book.title} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        ) : null}
                        <div className="cover-fallback-detail" style={{ display: hasCover ? 'none' : 'flex' }}>
                            <BookOpen size={64} style={{ opacity: 0.4 }} />
                            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-light)', textAlign: 'center' }}>{book.title}</span>
                        </div>
                    </div>

                    <div className="book-detail-info">
                        <h1>{book.title}</h1>
                        <p className="book-author-detail">by {book.author_name || 'Unknown Author'}</p>

                        <div className="book-detail-meta">
                            <span className="badge badge-accent">{book.genre || 'General'}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <StarRating rating={Math.round(parseFloat(book.average_rating))} />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {parseFloat(book.average_rating || 0).toFixed(1)} ({book.review_count} reviews)
                                </span>
                            </div>
                        </div>

                        <p className="book-isbn">ISBN: {book.isbn || 'N/A'} • Published: {book.publication_date ? new Date(book.publication_date).toLocaleDateString() : 'N/A'}</p>

                        <p className="book-detail-description">{book.description}</p>

                        <div className="book-detail-stats">
                            <div className="stat-card">
                                <div className="stat-value">{book.read_count}</div>
                                <div className="stat-label">Reads</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{book.rental_count}</div>
                                <div className="stat-label">Rentals</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{book.wishlist_count}</div>
                                <div className="stat-label">Wishlisted</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{book.available_copies}/{book.total_copies}</div>
                                <div className="stat-label">Available</div>
                            </div>
                        </div>

                        <div className="book-detail-actions">
                            {book.pdf_url && (
                                <button className="btn btn-primary btn-lg" onClick={() => navigate(`/books/${id}/read`)}>
                                    <BookOpen size={18} /> Read Online
                                </button>
                            )}
                            <button className="btn btn-secondary btn-lg" onClick={requestRental} disabled={book.available_copies <= 0}>
                                {book.available_copies > 0 ? <><Package size={18} /> Pay & Rent Book ($1.00)</> : <><XCircle size={18} /> Out of Stock</>}
                            </button>
                            <button className={`btn ${isWishlisted ? 'btn-danger' : 'btn-secondary'}`} onClick={toggleWishlist}>
                                {isWishlisted ? <><HeartOff size={18} /> Remove from Wishlist</> : <><Heart size={18} /> Add to Wishlist</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="reviews-section fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <h2>Reviews ({reviews.length})</h2>

                    {user && (
                        <form className="review-form" onSubmit={submitReview}>
                            <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Your Rating</label>
                                <StarRating rating={reviewForm.stars} onRate={(s) => setReviewForm({ ...reviewForm, stars: s })} interactive size="1.5rem" />
                            </div>
                            <div className="form-group">
                                <textarea className="form-input" placeholder="Write your review..." value={reviewForm.reviewText} onChange={(e) => setReviewForm({ ...reviewForm, reviewText: e.target.value })} rows={3} />
                            </div>
                            <button className="btn btn-primary" type="submit" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    )}

                    {reviews.length === 0 ? (
                        <div className="empty-state"><p>No reviews yet. Be the first!</p></div>
                    ) : (
                        reviews.map(review => (
                            <div key={review.id} className="review-card">
                                <div className="review-header">
                                    <div className="review-avatar">{review.user_name?.[0]?.toUpperCase()}</div>
                                    <div>
                                        <div className="review-name">{review.user_name}</div>
                                        <div className="review-date">{new Date(review.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ marginLeft: 'auto' }}>
                                        <StarRating rating={review.stars} size="0.85rem" />
                                    </div>
                                </div>
                                {review.review_text && <p className="review-text">{review.review_text}</p>}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
