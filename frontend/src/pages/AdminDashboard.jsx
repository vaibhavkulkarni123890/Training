import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, FileCheck, Award, TrendingUp, IndianRupee, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const [statsRes, pendingRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/stats`, { headers: { 'x-auth-token': token } }),
                axios.get(`${API_URL}/api/admin/pending-payments`, { headers: { 'x-auth-token': token } })
            ]);
            setStats(statsRes.data);
            setPendingPayments(pendingRes.data);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 403) {
                alert('Access denied. Admin only.');
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        if (!window.confirm('Are you sure you want to approve this payment? This will unlock their dashboard and send an email.')) return;
        
        setApprovingId(userId);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/payment/approve/${userId}`, {}, {
                headers: { 'x-auth-token': token }
            });
            alert('Payment successfully approved!');
            fetchData();
        } catch(err) {
            console.error(err);
            alert('Failed to approve payment');
        } finally {
            setApprovingId(null);
        }
    };

    if (loading) return <div className="section text-center">Loading admin data...</div>;
    if (!stats) return null;

    const statCards = [
        { label: "Total Registered", value: stats.totalUsers, icon: <Users className="text-primary" /> },
        { label: "Paid Enrollments", value: stats.paidUsers, icon: <FileCheck className="text-success" /> },
        { label: "Total Revenue", value: `₹${stats.totalAmount.toLocaleString('en-IN')}`, icon: <IndianRupee className="text-warning" /> },
        { label: "Courses Completed", value: stats.completedCourses, icon: <Award className="text-info" /> }
    ];

    return (
        <div className="section" style={{ background: '#f8fafc', minHeight: 'calc(100vh - 80px)' }}>
            <div className="container">
                <div style={{ marginBottom: '3rem' }}>
                    <h1>Admin <span style={{ color: 'var(--primary)' }}>Overview</span></h1>
                    <p style={{ color: 'var(--secondary)' }}>Lightweight statistics panel for platform monitoring.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-4" style={{ marginBottom: '3rem' }}>
                    {statCards.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="glass-card"
                            style={{ background: 'white', border: '1px solid #e2e8f0', padding: '1.5rem' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ color: 'var(--secondary)', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{stat.label}</p>
                                    <h2 style={{ margin: 0, color: '#1e293b' }}>{stat.value}</h2>
                                </div>
                                <div style={{ padding: '0.75rem', background: 'var(--primary-light)', borderRadius: '0.5rem' }}>
                                    {stat.icon}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="glass-card" style={{ background: '#eff6ff', border: '1px solid #dbeafe', padding: '2rem', textAlign: 'center' }}>
                    <ShieldCheck size={48} style={{ color: '#2563eb', margin: '0 auto 1rem' }} />
                    <h3 style={{ color: '#1e40af' }}>System Running Smoothly</h3>
                    <p style={{ color: '#3b82f6', maxWidth: '600px', margin: '0 auto' }}>
                        The platform is currently operating in lightweight mode to conserve server resources. Detailed user management and manual certificate approvals are disabled. 
                        Users automatically receive certificates upon submitting their required reports.
                    </p>
                </div>

                {/* Pending Payments Section */}
                <div style={{ marginTop: '4rem', marginBottom: '2rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Clock className="text-warning" /> Pending Manual Approvals ({pendingPayments.length})
                    </h2>
                    
                    {pendingPayments.length === 0 ? (
                        <div className="glass-card text-center" style={{ padding: '3rem', color: 'var(--secondary)' }}>
                            <CheckCircle size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                            <p>No pending payments right now. You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '1rem' }}>User Date</th>
                                        <th style={{ padding: '1rem' }}>Name & Email</th>
                                        <th style={{ padding: '1rem' }}>Plan Requested</th>
                                        <th style={{ padding: '1rem' }}>UPI Transaction ID</th>
                                        <th style={{ padding: '1rem' }}>Screenshot</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingPayments.map(payment => (
                                        <tr key={payment._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '1rem', color: '#64748b' }}>
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <strong>{payment.name}</strong><br/>
                                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{payment.email}</span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className="badge badge-primary">{payment.requestedPlan}</span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <code style={{ background: '#f1f5f9', padding: '0.3rem 0.5rem', borderRadius: '4px', letterSpacing: '1px' }}>
                                                    {payment.upiTransactionId}
                                                </code>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {payment.paymentScreenshotUrl ? (
                                                    <a href={`${API_URL}${payment.paymentScreenshotUrl}`} target="_blank" rel="noopener noreferrer">
                                                        <img 
                                                            src={`${API_URL}${payment.paymentScreenshotUrl}`} 
                                                            alt="Payment" 
                                                            style={{ width: '100px', height: 'auto', borderRadius: '4px', border: '1px solid #e2e8f0', cursor: 'zoom-in' }} 
                                                        />
                                                    </a>
                                                ) : (
                                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No image</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <button 
                                                    className="btn btn-primary" 
                                                    style={{ background: '#22c55e', border: 'none', padding: '0.5rem 1rem' }}
                                                    onClick={() => handleApprove(payment._id)}
                                                    disabled={approvingId === payment._id}
                                                >
                                                    {approvingId === payment._id ? 'Approving...' : 'Approve Payment'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
