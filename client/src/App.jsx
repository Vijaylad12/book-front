import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyOTP from './pages/Auth/VerifyOTP';
import BookList from './pages/Books/BookList';
import BookDetail from './pages/Books/BookDetail';
import PdfViewer from './pages/Books/PdfViewer';
import AddBook from './pages/Books/AddBook';
import Wishlist from './pages/Wishlist/Wishlist';
import Rentals from './pages/Rentals/Rentals';
import UserDashboard from './pages/Dashboard/UserDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManuscriptViewer from './pages/Admin/ManuscriptViewer';
import PaymentSuccess from './pages/Payment/PaymentSuccess';
import PaymentCancel from './pages/Payment/PaymentCancel';
import './styles/global.css';

function AppRoutes() {
    return (
        <>
            <Navbar />
            <Routes>
                {/* Public */}
                <Route path="/" element={<BookList />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/books/:id" element={<BookDetail />} />
                
                {/* Payment Result */}
                <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
                <Route path="/payment-cancel" element={<ProtectedRoute><PaymentCancel /></ProtectedRoute>} />

                {/* Auth Required */}
                <Route path="/books/new" element={<ProtectedRoute roles={['author', 'admin']}><AddBook /></ProtectedRoute>} />
                <Route path="/books/:id/edit" element={<ProtectedRoute roles={['author', 'admin']}><AddBook /></ProtectedRoute>} />
                <Route path="/books/:id/read" element={<ProtectedRoute><PdfViewer /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/rentals" element={<ProtectedRoute><Rentals /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

                {/* Admin Only */}
                <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/authors/:id/manuscript" element={<ProtectedRoute roles={['admin']}><ManuscriptViewer /></ProtectedRoute>} />
            </Routes>
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <ToastProvider>
                        <AppRoutes />
                    </ToastProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}
