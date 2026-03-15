import { useState } from 'react';

export default function StarRating({ rating = 0, onRate, size = '1.2rem', interactive = false }) {
    const [hover, setHover] = useState(0);

    return (
        <div className="stars" style={{ fontSize: size }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`star ${star <= (hover || rating) ? 'filled' : 'empty'}`}
                    onClick={() => interactive && onRate?.(star)}
                    onMouseEnter={() => interactive && setHover(star)}
                    onMouseLeave={() => interactive && setHover(0)}
                    style={{ cursor: interactive ? 'pointer' : 'default' }}
                >
                    ★
                </span>
            ))}
        </div>
    );
}
