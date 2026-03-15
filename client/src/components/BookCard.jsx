import { Link } from 'react-router-dom';
import { BookOpen, Package, Heart } from 'lucide-react';
import StarRating from './StarRating';
import './BookCard.css';

export default function BookCard({ book }) {
    const hasCover = !!book.cover_image_url;
    const coverUrl = hasCover ? `http://localhost:5000/${book.cover_image_url}` : null;

    return (
        <Link to={`/books/${book.id}`} className="book-card">
            <div className="book-cover">
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt={book.title}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                ) : null}
                <div className="cover-fallback" style={{ display: coverUrl ? 'none' : 'flex' }}>
                    <span className="cover-icon"><BookOpen size={48} /></span>
                    <span className="cover-title">{book.title}</span>
                </div>
                <div className="book-overlay">
                    <span className="badge badge-accent">{book.genre || 'General'}</span>
                </div>
            </div>
            <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">by {book.author_name || 'Unknown'}</p>
                <div className="book-meta">
                    <StarRating rating={Math.round(parseFloat(book.average_rating) || 0)} size="0.9rem" />
                    <span className="book-rating-num">({parseFloat(book.average_rating || 0).toFixed(1)})</span>
                </div>
                <div className="book-stats">
                    <span><BookOpen size={13} /> {book.read_count || 0}</span>
                    <span><Package size={13} /> {book.rental_count || 0}</span>
                    <span><Heart size={13} /> {book.wishlist_count || 0}</span>
                </div>
            </div>
        </Link>
    );
}
