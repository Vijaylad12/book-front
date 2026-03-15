import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Lock, ChevronLeft } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import api from '../../services/api';
import '../Books/PdfViewer.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

export default function ManuscriptViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const pdfDocRef = useRef(null);
    const renderTaskRef = useRef(null);
    const isRenderingRef = useRef(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1.3);
    const [rendering, setRendering] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [pageInput, setPageInput] = useState('1');

    useEffect(() => {
        const load = async () => {
            try {
                const pdfRes = await api.get(`/admin/authors/${id}/manuscript`, { responseType: 'arraybuffer' });
                const pdf = await pdfjsLib.getDocument({ data: pdfRes.data }).promise;
                pdfDocRef.current = pdf;
                setTotalPages(pdf.numPages);
                setCurrentPage(1);
                setPageInput('1');
            } catch (err) {
                setError(err.message || 'Failed to load manuscript.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const renderPage = useCallback(async (pageNum) => {
        if (!pdfDocRef.current || isRenderingRef.current) return;
        
        // Cancel existing render if any
        if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
        }

        isRenderingRef.current = true;
        setRendering(true);
        
        try {
            const page = await pdfDocRef.current.getPage(pageNum);
            
            // Adjust for high DPI screens
            const pixelRatio = window.devicePixelRatio || 1;
            const viewport = page.getViewport({ scale: scale * pixelRatio });
            
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Scale canvas down via CSS
            canvas.style.width = `${viewport.width / pixelRatio}px`;
            canvas.style.height = `${viewport.height / pixelRatio}px`;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            const renderTask = page.render(renderContext);
            renderTaskRef.current = renderTask;
            
            await renderTask.promise;
            renderTaskRef.current = null;
        } catch (err) { 
            if (err.name !== 'RenderingCancelledException') {
                console.error('Render error:', err);
            }
        } finally { 
            isRenderingRef.current = false;
            setRendering(false); 
        }
    }, [scale]);

    useEffect(() => {
        if (totalPages > 0) renderPage(currentPage);
    }, [currentPage, totalPages, scale, renderPage]);

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

    if (loading) {
        return (
            <div className="rv-loading">
                <div className="rv-loading-inner">
                    <div className="rv-loading-book">
                        <div className="rv-loading-page rv-loading-page-1"></div>
                        <div className="rv-loading-page rv-loading-page-2"></div>
                        <div className="rv-loading-page rv-loading-page-3"></div>
                    </div>
                    <h3>Opening manuscript...</h3>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rv-error">
                <div className="rv-error-inner">
                    <span className="rv-error-icon"><FileText size={48} /></span>
                    <h2>Unable to Load Manuscript</h2>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => navigate('/admin')}>← Back to Admin</button>
                </div>
            </div>
        );
    }

    return (
        <div className="rv-container">
            <div className="rv-toolbar">
                <div className="rv-toolbar-left">
                    <button className="rv-icon-btn" onClick={() => navigate('/admin')} title="Back to Dashboard">
                        <ChevronLeft size={18} />
                    </button>
                    <div className="rv-toolbar-divider"></div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Manuscript Review</span>
                </div>

                <div className="rv-toolbar-center">
                    <button className="rv-icon-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <div className="rv-page-indicator">
                        <input
                            type="text"
                            className="rv-page-input"
                            value={pageInput}
                            onChange={(e) => setPageInput(e.target.value)}
                            onKeyDown={handlePageInput}
                        />
                        <span className="rv-page-sep">/</span>
                        <span className="rv-page-total">{totalPages}</span>
                    </div>
                    <button className="rv-icon-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>

                    <div className="rv-toolbar-divider"></div>

                    <button className="rv-icon-btn" onClick={zoomOut}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg></button>
                    <span className="rv-zoom-label">{Math.round(scale * 100)}%</span>
                    <button className="rv-icon-btn" onClick={zoomIn}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg></button>
                </div>

                <div className="rv-toolbar-right">
                    <button className="rv-icon-btn" onClick={toggleFullscreen}>
                        {isFullscreen ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" /></svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></svg>
                        )}
                    </button>
                </div>
            </div>

            <div className="rv-body">
                <div className="rv-viewport" ref={containerRef}>
                    <div className="rv-canvas-wrapper">
                        {rendering && <div className="rv-rendering-overlay"><div className="spinner" /></div>}
                        <canvas ref={canvasRef} className="rv-canvas" />
                    </div>
                </div>
            </div>

            <div className="rv-bottombar">
                <span className="rv-secure-badge"><Lock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Admin Review Mode</span>
                <span className="rv-page-label">Page {currentPage} of {totalPages}</span>
            </div>
        </div>
    );
}
