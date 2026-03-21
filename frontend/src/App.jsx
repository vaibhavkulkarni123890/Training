import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Programs from './pages/Programs';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Success from './pages/Success';
import { LogIn, LayoutDashboard, LogOut, ShieldCheck, Menu, X } from 'lucide-react';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
};

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('user');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user?.role) setUserRole(user.role);
        } catch (e) { }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        navigate('/');
    };

    return (
        <nav className="navbar bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 flex justify-between items-center h-[70px]">
                <Link to="/" className="text-xl font-bold text-blue-600 no-underline flex items-center gap-2">
                    <ShieldCheck size={24} /> TVP IT Solutions
                </Link>

                {/* Mobile Menu Toggle */}
                <button 
                    className="md:hidden p-2 text-slate-600"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Desktop and Mobile Menu */}
                <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative top-[70px] md:top-0 left-0 w-full md:w-auto bg-white border-b md:border-0 border-slate-200 p-4 md:p-0 flex-col md:flex-row gap-4 items-center transition-all duration-300 z-40 shadow-lg md:shadow-none shadow-slate-200/50`}>
                    {isLoggedIn ? (
                        <>
                            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="btn btn-outline w-full md:w-auto flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium">
                                <LayoutDashboard size={16} /> Dashboard
                            </Link>
                            {userRole === 'admin' && (
                                <Link to="/admin-dashboard" onClick={() => setIsMenuOpen(false)} className="btn btn-outline w-full md:w-auto flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-blue-600">
                                    <ShieldCheck size={16} /> Admin
                                </Link>
                            )}
                            <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-red-500 font-medium md:p-2 flex items-center gap-2">
                                <LogOut size={18} /> <span className="md:hidden">Logout</span>
                            </button>
                        </>
                    ) : (
                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn btn-primary w-full md:w-auto flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium">
                            <LogIn size={16} /> Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/programs" element={<Programs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/success" element={<Success />} />
            </Routes>
        </Router>
    );
};

export default App;
