import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function PaymentCancel() {
    const navigate = useNavigate();

    return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="container" style={{ textAlign: 'center', maxWidth: 500, padding: 40, background: 'var(--bg-secondary)', borderRadius: 12 }}>
                <XCircle size={64} style={{ color: 'var(--danger)', marginBottom: 20 }} />
                <h2>Payment Cancelled</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 10, marginBottom: 30 }}>
                    You have cancelled the payment. No charges were made.
                </p>
                <button className="btn btn-secondary" onClick={() => navigate('/')}>
                    Browse More Books
                </button>
            </div>
        </div>
    );
}
