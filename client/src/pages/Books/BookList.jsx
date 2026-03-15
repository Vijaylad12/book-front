import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Library, Search, Clock, Star, Flame, Package, ArrowDownAZ, MailOpen, Heart } from 'lucide-react';
import api from '../../services/api';
import BookCard from '../../components/BookCard';
import { useAuth } from '../../context/AuthContext';
import './Books.css';

export default function BookList() {
    const [books, setBooks] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [searchParams, setSearchParams] = useSearchParams();
    const { user, isAuthor, isAdmin } = useAuth();

    const search = searchParams.get('search') || '';
    const genre = searchParams.get('genre') || '';
    const sortBy = searchParams.get('sortBy') || 'date';
    const page = parseInt(searchParams.get('page')) || 1;

    useEffect(() => { fetchBooks(); fetchGenres(); }, [search, genre, sortBy, page]);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (genre) params.set('genre', genre);
            params.set('sortBy', sortBy);
            params.set('page', page);
            params.set('limit', 12);
            const { data } = await api.get(`/books?${params}`);
            setBooks(data.data);
            setPagination(data.pagination);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchGenres = async () => {
        try { const { data } = await api.get('/books/genres'); setGenres(data.data || []); } catch { }
    };

    const updateParam = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(key, value); else newParams.delete(key);
        if (key !== 'page') newParams.set('page', '1');
        setSearchParams(newParams);
    };

    return (
        <div className="page">
            {/* ═══ Premium Hero Section ═══ */}
            <section className="hero-section">
                <div className="hero-bg">
                    <div className="hero-orb hero-orb-1"></div>
                    <div className="hero-orb hero-orb-2"></div>
                    <div className="hero-orb hero-orb-3"></div>
                    <div className="hero-grid-overlay"></div>
                </div>
                <div className="container hero-content">
                    <div className="hero-badge"><Library size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Your Digital Library</div>
                    <h1 className="hero-title">
                        Discover, Read &<br />
                        <span className="hero-gradient-text">Experience Great Books</span>
                    </h1>
                    <p className="hero-subtitle">
                        Explore our curated collection of <strong>{pagination.total || 0}</strong> amazing books.
                        Read online, rent physical copies, and join a community of readers.
                    </p>

                    <div className="hero-search">
                        <span className="hero-search-icon"><Search size={20} /></span>
                        <input
                            type="text"
                            className="hero-search-input"
                            placeholder="Search by title, author, or description..."
                            value={search}
                            onChange={(e) => updateParam('search', e.target.value)}
                        />
                        {search && (
                            <button className="hero-search-clear" onClick={() => updateParam('search', '')}>✕</button>
                        )}
                    </div>

                    <div className="hero-stats">
                        <div className="hero-stat">
                            <span className="hero-stat-value">{pagination.total || 0}</span>
                            <span className="hero-stat-label">Books</span>
                        </div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat">
                            <span className="hero-stat-value">{genres.length}</span>
                            <span className="hero-stat-label">Genres</span>
                        </div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat">
                            <span className="hero-stat-value">24/7</span>
                            <span className="hero-stat-label">Access</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container">
                {/* ═══ Filter Bar ═══ */}
                <div className="filters-section fade-in-up">
                    <div className="filters-left">
                        <div className="filter-chips">
                            <button
                                className={`filter-chip ${!genre ? 'active' : ''}`}
                                onClick={() => updateParam('genre', '')}
                            >All</button>
                            {genres.map(g => (
                                <button
                                    key={g}
                                    className={`filter-chip ${genre === g ? 'active' : ''}`}
                                    onClick={() => updateParam('genre', g)}
                                >{g}</button>
                            ))}
                        </div>
                    </div>
                    <div className="filters-right">
                        <select className="sort-select" value={sortBy} onChange={(e) => updateParam('sortBy', e.target.value)}>
                            <option value="date">Newest</option>
                            <option value="rating">Highest Rated</option>
                            <option value="popularity">Most Popular</option>
                            <option value="rentals">Most Rented</option>
                            <option value="title">A-Z</option>
                        </select>
                    </div>
                </div>

                {/* ═══ Book Grid ═══ */}
                {loading ? (
                    <div className="loader"><div className="spinner"></div></div>
                ) : books.length === 0 ? (
                    <div className="empty-state fade-in-up">
                        <div className="empty-icon"><MailOpen size={48} /></div>
                        <h3>No books found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <div className="books-grid fade-in-up">
                            {books.map((book, i) => (
                                <div key={book.id} style={{ animationDelay: `${i * 0.05}s` }} className="fade-in-up">
                                    <BookCard book={book} />
                                </div>
                            ))}
                        </div>

                        {pagination.totalPages > 1 && (
                            <div className="pagination">
                                <button className="page-btn" disabled={page <= 1} onClick={() => updateParam('page', page - 1)}>
                                    ←  Previous
                                </button>
                                <div className="page-numbers">
                                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                                        const p = i + 1;
                                        return (
                                            <button key={p} className={`page-num ${page === p ? 'active' : ''}`} onClick={() => updateParam('page', p)}>
                                                {p}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button className="page-btn" disabled={page >= pagination.totalPages} onClick={() => updateParam('page', page + 1)}>
                                    Next  →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ═══ Footer ═══ */}
            <footer className="site-footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="footer-logo"><Library size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> BookLibrary</div>
                            <p className="footer-tagline">Your gateway to infinite knowledge and imagination. Read, rent, and discover books that change your perspective.</p>
                        </div>
                        <div className="footer-links-section">
                            <h4>Quick Links</h4>
                            <Link to="/">Browse Books</Link>
                            {user && <Link to="/dashboard">Dashboard</Link>}
                            {user && <Link to="/wishlist">My Wishlist</Link>}
                            {user && <Link to="/rentals">My Rentals</Link>}
                        </div>
                        <div className="footer-links-section">
                            <h4>Account</h4>
                            {!user && <Link to="/login">Login</Link>}
                            {!user && <Link to="/register">Create Account</Link>}
                            {(isAuthor || isAdmin) && <Link to="/books/new">Add a Book</Link>}
                            {isAdmin && <Link to="/admin">Admin Panel</Link>}
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2024 BookLibrary. Built with <Heart size={14} style={{ verticalAlign: 'middle', color: 'var(--danger)' }} /> for book lovers everywhere.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
