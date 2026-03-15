import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ImagePlus, FileText, Rocket, Library, Package, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../services/api';
import './AddBook.css';

export default function AddBook() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: '', genre: '', description: '', isbn: '',
        publicationDate: null, totalCopies: 1,
    });
    const [coverImage, setCoverImage] = useState(null);
    const [pdf, setPdf] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    const genres = ['Fiction', 'Fantasy', 'Romance', 'Thriller', 'History', 'Science', 'Technology', 'Biography', 'Self-Help', 'Poetry', 'Other'];

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            api.get(`/books/${id}`)
                .then(res => {
                    const book = res.data.data;
                    setForm({
                        title: book.title || '',
                        genre: book.genre || '',
                        description: book.description || '',
                        isbn: book.isbn || '',
                        publicationDate: book.publication_date ? new Date(book.publication_date) : null,
                        totalCopies: book.total_copies || 1,
                    });
                    if (book.cover_image_url) {
                        setCoverPreview(`http://localhost:5000/${book.cover_image_url}`);
                    }
                })
                .catch(err => {
                    setError('Failed to load book for editing.');
                    console.error(err);
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEditMode]);

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return setError('Title is required.');
        if (!form.genre) return setError('Please select a genre.');

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('genre', form.genre);
            formData.append('description', form.description);
            formData.append('isbn', form.isbn);
            formData.append('publicationDate', form.publicationDate ? form.publicationDate.toISOString().split('T')[0] : '');
            formData.append('totalCopies', form.totalCopies);
            if (coverImage) formData.append('coverImage', coverImage);
            if (pdf) formData.append('pdf', pdf);

            let resData;
            if (isEditMode) {
                const { data } = await api.put(`/books/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                resData = data;
            } else {
                const { data } = await api.post('/books', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                resData = data;
            }

            navigate(`/books/${isEditMode ? id : resData.data.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add book.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div className="add-book-layout fade-in-up">
                    <div className="add-book-form-section">
                        <div className="section-header">
                            <div>
                                <h2><BookOpen size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} /> {isEditMode ? 'Edit Book' : 'Add New Book'}</h2>
                                <p className="subtitle">{isEditMode ? 'Update your book details' : 'Publish your work to the library'}</p>
                            </div>
                        </div>

                        {error && <div className="auth-error" style={{ marginBottom: 20 }}>{error}</div>}

                        <form onSubmit={handleSubmit} className="add-book-form">
                            <div className="form-group">
                                <label htmlFor="book-title">Book Title *</label>
                                <input id="book-title" type="text" className="form-input" placeholder="Enter book title"
                                    value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label htmlFor="book-genre">Genre *</label>
                                    <select id="book-genre" className="form-input" value={form.genre}
                                        onChange={(e) => setForm({ ...form, genre: e.target.value })} required>
                                        <option value="">Select genre...</option>
                                        {genres.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="book-isbn">ISBN</label>
                                    <input id="book-isbn" type="text" className="form-input" placeholder="978-0-XX-XXXXXX-X"
                                        value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="book-description">Description</label>
                                <textarea id="book-description" className="form-input" rows={4}
                                    placeholder="Write a compelling description of your book..."
                                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label htmlFor="book-date"><Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Publication Date</label>
                                    <DatePicker
                                        id="book-date"
                                        selected={form.publicationDate}
                                        onChange={(date) => setForm({ ...form, publicationDate: date })}
                                        className="form-input"
                                        placeholderText="Select a date"
                                        dateFormat="yyyy-MM-dd"
                                        maxDate={new Date()}
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        isClearable
                                        calendarClassName="dark-calendar"
                                        onKeyDown={(e) => e.preventDefault()}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="book-copies">Total Copies</label>
                                    <input id="book-copies" type="number" className="form-input" min={1} max={1000}
                                        value={form.totalCopies} onChange={(e) => setForm({ ...form, totalCopies: parseInt(e.target.value) || 1 })} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Cover Image</label>
                                <div className="file-upload" onClick={() => document.getElementById('cover-file').click()}>
                                    <span className="file-upload-icon"><ImagePlus size={24} /></span>
                                    <span>{coverImage ? coverImage.name : 'Click to upload cover image (JPG, PNG)'}</span>
                                </div>
                                <input id="cover-file" type="file" accept="image/*" hidden onChange={handleCoverChange} />
                            </div>

                            <div className="form-group">
                                <label>PDF File</label>
                                <div className="file-upload" onClick={() => document.getElementById('pdf-file').click()}>
                                    <span className="file-upload-icon"><FileText size={24} /></span>
                                    <span>{pdf ? pdf.name : 'Click to upload PDF file'}</span>
                                </div>
                                <input id="pdf-file" type="file" accept=".pdf" hidden onChange={(e) => setPdf(e.target.files[0])} />
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                                {loading ? (isEditMode ? 'Saving...' : 'Publishing...') : <><Rocket size={18} /> {isEditMode ? 'Save Changes' : 'Publish Book'}</>}
                            </button>
                        </form>
                    </div>

                    {/* Live Preview */}
                    <div className="add-book-preview">
                        <h3>Preview</h3>
                        <div className="preview-card">
                            <div className="preview-cover">
                                {coverPreview ? (
                                    <img src={coverPreview} alt="Cover preview" />
                                ) : (
                                    <div className="preview-placeholder">
                                        <Library size={48} />
                                        <p>Cover Image</p>
                                    </div>
                                )}
                            </div>
                            <div className="preview-info">
                                <h4>{form.title || 'Book Title'}</h4>
                                {form.genre && <span className="badge badge-accent">{form.genre}</span>}
                                {form.description && <p className="preview-desc">{form.description.substring(0, 120)}{form.description.length > 120 ? '...' : ''}</p>}
                                {form.isbn && <p className="preview-isbn">ISBN: {form.isbn}</p>}
                                <p className="preview-copies"><Package size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {form.totalCopies} copies</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
