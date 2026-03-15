import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Heart, HeartOff } from 'lucide-react';
import BookCard from '../../components/BookCard';
import './Wishlist.css';

export default function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchWishlist(); }, []);

    const fetchWishlist = async () => {
        try {
            const { data } = await api.get('/wishlists');
            setWishlist(data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const removeFromWishlist = async (bookId) => {
        try {
            await api.delete(`/wishlists/${bookId}`);
            setWishlist(wishlist.filter(w => w.book_id !== bookId));
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="loader"><div className="spinner"></div></div>;

    return (
        <div className="page">
            <div className="container">
                <div className="section-header fade-in-up">
                    <div>
                        <h2><Heart size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} /> My Wishlist</h2>
                        <p className="subtitle">{wishlist.length} book{wishlist.length !== 1 ? 's' : ''} saved</p>
                    </div>
                </div>

                {wishlist.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><HeartOff size={48} /></div>
                        <h3>Your wishlist is empty</h3>
                        <p>Browse books and add your favorites!</p>
                    </div>
                ) : (
                    <div className="wishlist-grid fade-in-up">
                        {wishlist.map(item => (
                            <div key={item.id} className="wishlist-item">
                                <BookCard book={{ id: item.book_id, title: item.title, cover_image_url: item.cover_image_url, genre: item.genre, average_rating: item.average_rating, author_name: item.author_name }} />
                                <button className="btn btn-danger btn-sm wishlist-remove" onClick={() => removeFromWishlist(item.book_id)}>
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
