import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import './Toast.css';

export default function ConfirmModal({ open, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', onConfirm, onCancel }) {
    if (!open) return null;

    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                <div className={`confirm-icon ${variant}`}>
                    <AlertTriangle size={24} />
                </div>
                <h3 className="confirm-title">{title}</h3>
                <p className="confirm-message">{message}</p>
                <div className="confirm-actions">
                    <button className="confirm-btn confirm-btn-cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className={`confirm-btn confirm-btn-${variant}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
