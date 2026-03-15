import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, MailOpen, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import './Rentals.css';

export default function Rentals() {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmState, setConfirmState] = useState({ open: false, rentalId: null });
    const toast = useToast();

    useEffect(() => { fetchRentals(); }, []);

    const fetchRentals = async () => {
        try {
            const { data } = await api.get('/rentals/my');
            setRentals(data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const initiateReturn = async (rentalId) => {
        setConfirmState({ open: true, rentalId });
    };

    const handleConfirmReturn = async () => {
        const rentalId = confirmState.rentalId;
        setConfirmState({ open: false, rentalId: null });
        try {
            await api.put(`/rentals/${rentalId}/return`);
            toast.success('Return initiated successfully!');
            fetchRentals();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to initiate return.');
        }
    };

    const handleCancelRental = async (rentalId) => {
        if (!window.confirm("Are you sure you want to cancel this pending rental request?")) return;
        try {
            await api.put(`/rentals/${rentalId}/cancel`);
            toast.success('Rental cancelled successfully!');
            fetchRentals();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel rental.');
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            pending_payment: { cls: 'badge-warning', label: 'Pending Payment' },
            requested: { cls: 'badge-info', label: 'Requested' },
            confirmed: { cls: 'badge-accent', label: 'Confirmed' },
            dispatched: { cls: 'badge-warning', label: 'Dispatched' },
            return_initiated: { cls: 'badge-accent', label: 'Return Initiated' },
            completed: { cls: 'badge-success', label: 'Completed' },
        };
        const s = map[status] || { cls: 'badge-info', label: status };
        return <span className={`badge ${s.cls}`}>{s.label}</span>;
    };

    if (loading) return <div className="loader"><div className="spinner"></div></div>;

    return (
        <div className="page">
            <div className="container">
                <div className="section-header fade-in-up">
                    <div>
                        <h2><Package size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} /> My Rentals</h2>
                        <p className="subtitle">{rentals.length} rental{rentals.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                {rentals.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><MailOpen size={48} /></div>
                        <h3>No rentals yet</h3>
                        <p>Browse books and rent your favorites!</p>
                    </div>
                ) : (
                    <div className="rentals-list fade-in-up">
                        {rentals.map(rental => (
                            <div key={rental.id} className="rental-card card">
                                <div className="rental-cover">
                                    <img
                                        src={rental.cover_image_url ? `/api/${rental.cover_image_url}` : `https://placehold.co/100x140/1a1a3e/6C63FF?text=Book`}
                                        alt={rental.book_title}
                                        onError={(e) => { e.target.src = 'https://placehold.co/100x140/1a1a3e/6C63FF?text=Book'; }}
                                    />
                                </div>
                                <div className="rental-info">
                                    <Link to={`/books/${rental.book_id}`} className="rental-title">{rental.book_title}</Link>
                                    <div className="rental-meta">
                                        {getStatusBadge(rental.status)}
                                        {rental.due_date && (
                                            <span className="rental-due">Due: {new Date(rental.due_date).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                    <div className="rental-dates">
                                        <span>Requested: {new Date(rental.requested_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="rental-actions">
                                    {rental.status === 'dispatched' && (
                                        <button className="btn btn-secondary btn-sm" onClick={() => initiateReturn(rental.id)}>
                                            <RotateCcw size={14} /> Return Book
                                        </button>
                                    )}
                                    {rental.status === 'pending_payment' && (
                                        <button className="btn btn-danger btn-sm" onClick={() => handleCancelRental(rental.id)}>
                                            <RotateCcw size={14} /> Cancel Request
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                open={confirmState.open}
                title="Return Book"
                message="Are you sure you want to return this book? This will initiate the return process."
                confirmText="Return Book"
                variant="primary"
                onConfirm={handleConfirmReturn}
                onCancel={() => setConfirmState({ open: false, rentalId: null })}
            />
        </div>
    );
}
