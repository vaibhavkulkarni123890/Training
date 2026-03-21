import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, Phone, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', referrerCode: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';
            const payload = isSignup
                ? { name: formData.name, email: formData.email, phone: formData.phone, password: formData.password, referrerCode: formData.referrerCode }
                : { email: formData.email, password: formData.password };

            const { data } = await axios.post(`${API_URL}${endpoint}`, payload);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', background: 'radial-gradient(circle at top right, #e0f2fe 0%, #ffffff 100%)' }}>
            <div className="container" style={{ maxWidth: '440px' }}>
                <div className="glass-card" style={{ background: 'white', padding: '2.5rem' }}>
                    {/* Tab Switcher */}
                    <div style={{ display: 'flex', marginBottom: '2rem', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <button
                            onClick={() => { setIsSignup(false); setError(''); }}
                            style={{
                                flex: 1, padding: '0.75rem', border: 'none', cursor: 'pointer',
                                background: !isSignup ? 'var(--primary)' : 'white',
                                color: !isSignup ? 'white' : 'var(--secondary)',
                                fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <LogIn size={18} /> Login
                        </button>
                        <button
                            onClick={() => { setIsSignup(true); setError(''); }}
                            style={{
                                flex: 1, padding: '0.75rem', border: 'none', cursor: 'pointer',
                                background: isSignup ? 'var(--primary)' : 'white',
                                color: isSignup ? 'white' : 'var(--secondary)',
                                fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <UserPlus size={18} /> Sign Up
                        </button>
                    </div>

                    <h2 className="text-center" style={{ marginBottom: '0.5rem' }}>
                        {isSignup ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-center" style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                        {isSignup ? 'Join TVP IT Solutions training program' : 'Login to your dashboard'}
                    </p>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {isSignup && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                                    <User size={16} /> Full Name
                                </label>
                                <input
                                    type="text" name="name" required
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }}
                                />
                            </div>
                        )}

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                                <Mail size={16} /> Email Address
                            </label>
                            <input
                                type="email" name="email" required
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }}
                            />
                        </div>

                        {isSignup && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                                    <Phone size={16} /> Phone Number
                                </label>
                                <input
                                    type="tel" name="phone"
                                    placeholder="Enter your phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }}
                                />
                            </div>
                        )}

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
                                <Lock size={16} /> Password
                            </label>
                            <input
                                type="password" name="password" required
                                placeholder={isSignup ? 'Create a password' : 'Enter your password'}
                                value={formData.password}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none' }}
                            />
                        </div>

                        {isSignup && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#2563eb' }}>
                                    🎁 Referral Code (Optional)
                                </label>
                                <input
                                    type="text" name="referrerCode"
                                    placeholder="Enter referral code"
                                    value={formData.referrerCode}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #bfdbfe', background: '#f8fafc', fontSize: '0.95rem', outline: 'none' }}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Login'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
                        {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                        <span
                            onClick={() => { setIsSignup(!isSignup); setError(''); }}
                            style={{ color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {isSignup ? 'Login' : 'Sign Up'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
