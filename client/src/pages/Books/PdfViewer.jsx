import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, BookOpen, Star, Lock } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import api from '../../services/api';
import './PdfViewer.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

export default function PdfViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const pdfDocRef = useRef(null);
    const hasFetchedRef = useRef(false);

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1.3);
    const [rendering, setRendering] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [pageInput, setPageInput] = useState('1');

    // Load PDF
    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        const load = async () => {
            try {
                const [bookRes, pdfRes] = await Promise.all([
                    api.get(`/books/${id}`),
                    api.get(`/books/${id}/read`, { responseType: 'arraybuffer' }),
                ]);
                setBook(bookRes.data.data);

                const pdf = await pdfjsLib.getDocument({ data: pdfRes.data }).promise;
                pdfDocRef.current = pdf;
                setTotalPages(pdf.numPages);
                setCurrentPage(1);
                setPageInput('1');
            } catch (err) {
                if (err.response?.data) {
                    try {
                        const text = new TextDecoder().decode(err.response.data);
                        const json = JSON.parse(text);
                        setError(json.message);
                    } catch { setError('Failed to load PDF.'); }
                } else {
                    setError(err.message || 'Failed to load PDF.');
                }
                try { const r = await api.get(`/books/${id}`); setBook(r.data.data); } catch { }
            } finally { setLoading(false); }
        };
        load();
    }, [id]);

    // Render page
    const renderPage = useCallback(async (pageNum) => {
        if (!pdfDocRef.current || rendering) return;
        setRendering(true);
        try {
            const page = await pdfDocRef.current.getPage(pageNum);
            const viewport = page.getViewport({ scale });
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: ctx, viewport }).promise;
        } catch (err) { console.error('Render error:', err); }
        finally { setRendering(false); }
    }, [scale, rendering]);

    useEffect(() => {
        if (totalPages > 0) renderPage(currentPage);
    }, [currentPage, totalPages, scale]);

    const goToPage = (p) => {
        const page = Math.max(1, Math.min(p, totalPages));
        setCurrentPage(page);
        setPageInput(String(page));
        if (containerRef.current) containerRef.current.scrollTop = 0;
    };

    const handlePageInput = (e) => {
        if (e.key === 'Enter') {
            const p = parseInt(pageInput);
            if (!isNaN(p)) goToPage(p);
        }
    };

    const zoomIn = () => setScale(s => Math.min(s + 0.2, 3));
    const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));
    const zoomFit = () => setScale(1.3);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const h = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', h);
        return () => document.removeEventListener('fullscreenchange', h);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goToPage(currentPage + 1); }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goToPage(currentPage - 1); }
            if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomIn(); }
            if (e.key === '-') { e.preventDefault(); zoomOut(); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [currentPage, totalPages]);

    if (loading) {
        return (
            <div className="rv-loading">
                <div className="rv-loading-inner">
                    <div className="rv-loading-book">
                        <div className="rv-loading-page rv-loading-page-1"></div>
                        <div className="rv-loading-page rv-loading-page-2"></div>
                        <div className="rv-loading-page rv-loading-page-3"></div>
                    </div>
                    <h3>Opening your book...</h3>
                    <p>Preparing a seamless reading experience</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rv-error">
                <div className="rv-error-inner">
                    <span className="rv-error-icon"><FileText size={48} /></span>
                    <h2>Unable to Load Book</h2>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => navigate(`/books/${id}`)}>← Return to Book</button>
                </div>
            </div>
        );
    }

    return (
        <div className="rv-container">
            {/* ═══ Top Toolbar ═══ */}
            <div className="rv-toolbar">
                <div className="rv-toolbar-left">
                    <button className="rv-icon-btn" onClick={() => navigate(`/books/${id}`)} title="Back to book">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="rv-toolbar-divider"></div>
                    <button className={`rv-icon-btn ${showSidebar ? 'active' : ''}`} onClick={() => setShowSidebar(!showSidebar)} title="Toggle sidebar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
                    </button>
                </div>

                <div className="rv-toolbar-center">
                    {/* Page Navigation */}
                    <button className="rv-icon-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1} title="Previous page">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <div className="rv-page-indicator">
                        <input
                            type="text"
                            className="rv-page-input"
                            value={pageInput}
                            onChange={(e) => setPageInput(e.target.value)}
                            onKeyDown={handlePageInput}
                            onBlur={() => { const p = parseInt(pageInput); if (!isNaN(p)) goToPage(p); else setPageInput(String(currentPage)); }}
                        />
                        <span className="rv-page-sep">/</span>
                        <span className="rv-page-total">{totalPages}</span>
                    </div>
                    <button className="rv-icon-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages} title="Next page">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>

                    <div className="rv-toolbar-divider"></div>

                    {/* Zoom Controls */}
                    <button className="rv-icon-btn" onClick={zoomOut} title="Zoom out (-)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                    </button>
                    <span className="rv-zoom-label">{Math.round(scale * 100)}%</span>
                    <button className="rv-icon-btn" onClick={zoomIn} title="Zoom in (+)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                    </button>
                    <button className="rv-icon-btn" onClick={zoomFit} title="Fit to width">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></svg>
                    </button>
                </div>

                <div className="rv-toolbar-right">
                    <button className="rv-icon-btn" onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                        {isFullscreen ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" /></svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></svg>
                        )}
                    </button>
                </div>
            </div>

            <div className="rv-body">
                {/* ═══ Sidebar ═══ */}
                {showSidebar && book && (
                    <aside className="rv-sidebar">
                        <div className="rv-sidebar-cover">
                            {book.cover_image_url ? (
                                <img src={`http://localhost:5000/${book.cover_image_url}`} alt={book.title} />
                            ) : (
                                <div className="rv-sidebar-cover-fallback">
                                    <span><BookOpen size={32} /></span>
                                    <span>{book.title}</span>
                                </div>
                            )}
                        </div>
                        <div className="rv-sidebar-info">
                            <h3 className="rv-sidebar-title">{book.title}</h3>
                            <p className="rv-sidebar-author">by {book.author_name || 'Unknown'}</p>
                            <div className="rv-sidebar-stats">
                                <div className="rv-sidebar-stat">
                                    <span className="rv-sidebar-stat-val"><Star size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {parseFloat(book.average_rating || 0).toFixed(1)}</span>
                                    <span className="rv-sidebar-stat-lbl">Rating</span>
                                </div>
                                <div className="rv-sidebar-stat">
                                    <span className="rv-sidebar-stat-val"><BookOpen size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {book.read_count || 0}</span>
                                    <span className="rv-sidebar-stat-lbl">Reads</span>
                                </div>
                            </div>
                            {book.genre && <span className="rv-sidebar-genre">{book.genre}</span>}
                            {book.description && <p className="rv-sidebar-desc">{book.description}</p>}
                        </div>
                        <div className="rv-sidebar-shortcuts">
                            <div className="rv-shortcut"><kbd>←</kbd><kbd>→</kbd> Navigate pages</div>
                            <div className="rv-shortcut"><kbd>+</kbd><kbd>-</kbd> Zoom in/out</div>
                        </div>
                    </aside>
                )}

                {/* ═══ PDF Canvas ═══ */}
                <div className="rv-viewport" ref={containerRef}>
                    <div className="rv-canvas-wrapper">
                        {rendering && <div className="rv-rendering-overlay"><div className="spinner" /></div>}
                        <canvas ref={canvasRef} className="rv-canvas" />
                    </div>
                </div>
            </div>

            {/* ═══ Bottom Bar ═══ */}
            <div className="rv-bottombar">
                <span className="rv-secure-badge"><Lock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Secure Reader</span>
                <div className="rv-progress-wrap">
                    <div className="rv-progress-bar">
                        <div className="rv-progress-fill" style={{ width: `${(currentPage / totalPages) * 100}%` }}></div>
                    </div>
                    <span className="rv-progress-pct">{Math.round((currentPage / totalPages) * 100)}% complete</span>
                </div>
                <span className="rv-page-label">Page {currentPage} of {totalPages}</span>
            </div>
        </div>
    );
}
