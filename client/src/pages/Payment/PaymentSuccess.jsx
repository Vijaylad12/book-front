import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import api from '../../services/api';

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [verifying, setVerifying] = useState(true);
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const verifySession = async () => {
            if (!sessionId) {
                navigate('/rentals');
                return;
            }
            try {
                // Manually sync session since local webhooks fail
                await api.get(`/payment/sync-session?session_id=${sessionId}`);
            } catch (err) {
                console.error("Failed to sync session securely", err);
            } finally {
                setVerifying(false); // Render the success page either way
            }
        }
        
        verifySession();
    }, [sessionId, navigate]);

    if (verifying) return <div className="loader"><div className="spinner"></div></div>;

    return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="container" style={{ textAlign: 'center', maxWidth: 500, padding: 40, background: 'var(--bg-secondary)', borderRadius: 12 }}>
                <CheckCircle size={64} style={{ color: 'var(--success)', marginBottom: 20 }} />
                <h2>Payment Successful!</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 10, marginBottom: 30 }}>
                    Your rental request was processed successfully. You can now track your rental status in your dashboard.
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/rentals')}>
                    View My Rentals
                </button>
            </div>
        </div>
    );
}
