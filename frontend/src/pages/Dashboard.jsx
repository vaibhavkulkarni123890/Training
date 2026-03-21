import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, FolderKanban, FileText, Shield, Users2,
    Upload, CheckCircle, AlertCircle, TrendingUp, Clock, Download,
    Search, Filter, Lock, Zap, Award, ChevronRight, Calendar, ExternalLink, QrCode,
    Menu, X
} from 'lucide-react';
import upiQr from '../assets/upi_qr.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);
    const [reports, setReports] = useState([]);
    const [deadline, setDeadline] = useState(null);
    const [loading, setLoading] = useState(true);
    const [textContent, setTextContent] = useState('');
    const [plagiarismInput, setPlagiarismInput] = useState('');
    const [plagiarismResult, setPlagiarismResult] = useState(null);
    const [projectFilter, setProjectFilter] = useState({ category: '', difficulty: '' });
    const [selectedProjectDetail, setSelectedProjectDetail] = useState(null);
    const [confirmingProject, setConfirmingProject] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [transactionId, setTransactionId] = useState('');
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/auth/me`, {
                headers: { 'x-auth-token': token }
            });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));

            if (data.paymentStatus === 'paid') {
                fetchProjects();
                fetchReports();
                fetchDeadline();
            }
        } catch (err) {
            console.error(err);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const params = {};
            if (projectFilter.category) params.category = projectFilter.category;
            if (projectFilter.difficulty) params.difficulty = projectFilter.difficulty;
            const { data } = await axios.get(`${API_URL}/api/projects`, { params });
            setProjects(data);
        } catch (err) { console.error(err); }
    };

    const fetchReports = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/reports/my-reports`, {
                headers: { 'x-auth-token': token }
            });
            setReports(data);
        } catch (err) { console.error(err); }
    };

    const fetchDeadline = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/reports/deadline`, {
                headers: { 'x-auth-token': token }
            });
            setDeadline(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { if (user?.paymentStatus === 'paid') fetchProjects(); }, [projectFilter]);

    const handleSelectProject = async (projectId) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/projects/select`,
                { projectId },
                { headers: { 'x-auth-token': token } }
            );
            setConfirmingProject(null);
            alert('Project selected successfully! Check your email.');
            fetchUserData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to select project');
        }
    };

    const handleSubmitReport = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/api/reports/submit`,
                { textContent, weekNumber: reports.length + 1 },
                { headers: { 'x-auth-token': token } }
            );
            setTextContent('');
            fetchReports();
            fetchDeadline();
            
            if (res.data.courseCompleted) {
                alert('Congratulations! You have completed your project and your certificate has been generated.');
                fetchUserData(); 
            } else {
                alert('Report submitted successfully!');
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to submit report');
        }
    };

    const handlePlagiarismCheck = async () => {
        if (!plagiarismInput.trim()) return;
        try {
            const { data } = await axios.post(`${API_URL}/api/submissions/submit-project`, {
                email: user.email,
                codeContent: plagiarismInput,
                githubLink: plagiarismInput.startsWith('http') ? plagiarismInput : ''
            });
            setPlagiarismResult(data.submission);
        } catch (err) {
            alert(err.response?.data?.error || 'Plagiarism check failed');
        }
    };

    const handleEnrollPayment = (plan) => {
        setSelectedPlan(plan);
        setTransactionId('');
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        if (!paymentScreenshot) {
            alert('Please upload a payment screenshot');
            return;
        }
        setPaymentLoading(true);
        try {
            const formData = new FormData();
            formData.append('transactionId', transactionId);
            formData.append('planType', selectedPlan.name.includes('Advanced') ? 'Advanced' : 'Foundation');
            formData.append('amount', selectedPlan.price);
            formData.append('screenshot', paymentScreenshot);

            await axios.post(`${API_URL}/api/payment/submit-upi`, formData, { 
                headers: { 
                    'x-auth-token': token
                } 
            });
            alert('Payment submitted successfully! Our team will verify it within 24 hours.');
            fetchUserData(); // This will trigger the pending screen
        } catch (err) {
            alert(err.response?.data?.error || 'Payment submission failed. Please try again.');
        } finally {
            setPaymentLoading(false);
            setSelectedPlan(null);
            setPaymentScreenshot(null);
        }
    };

    if (loading) return <div className="text-center section">Loading...</div>;
    if (!user) return null;

    if (user.paymentStatus === 'pending') {
        return (
            <div className="section" style={{ background: '#f8fafc', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center' }}>
                <div className="container text-center">
                    <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem', border: '1px solid #e2e8f0' }}>
                        <Clock size={48} style={{ color: '#f59e0b', margin: '0 auto 1.5rem' }} />
                        <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>Payment Under Review ⏳</h2>
                        <p style={{ color: 'var(--secondary)', lineHeight: 1.6, marginBottom: '2rem', fontSize: '1.1rem' }}>
                            We have safely received your UPI Reference Number for the <strong>{user.requestedPlan} Program</strong>. 
                            Our team is manually verifying the payment to unlock your dashboard.
                            <br/><br/>
                            This usually takes a few hours. Please check back later!
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                            Questions? Email us at <a href="mailto:contact@threatviper.com" style={{ color: '#2563eb' }}>contact@threatviper.com</a>
                        </p>
                        <button className="btn btn-outline" style={{ marginTop: '2rem' }} onClick={() => { localStorage.removeItem('token'); navigate('/'); }}>
                            Logout securely
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isPaid = user.paymentStatus === 'paid';
    const hasProject = !!user.selectedProject;

    const sidebarItems = [
        { id: 'overview', icon: <LayoutDashboard size={18} />, label: 'Overview' },
        { id: 'programs', icon: <BookOpen size={18} />, label: 'Programs' },
        { id: 'projects', icon: <FolderKanban size={18} />, label: 'Projects', locked: !isPaid },
        { id: 'reports', icon: <FileText size={18} />, label: 'Reports', locked: !hasProject },
        { id: 'plagiarism', icon: <Shield size={18} />, label: 'Plagiarism', locked: !hasProject },
        { id: 'referral', icon: <Users2 size={18} />, label: 'Referral' }
    ];

    const plans = [
        { name: "Foundation Program", duration: "4 Months", price: 1099, priceDisplay: "₹1,099", features: ["1 Advanced Industry-Level Project", "Weekly Evaluation System", "Plagiarism Detection Enabled", "Certificate of Completion"] },
        { name: "Advanced Program", duration: "6 Months", price: 1999, priceDisplay: "₹1,999", features: ["1 Highly Advanced Project (Production-Level)", "Deep Evaluation & Code Quality Checks", "Plagiarism Detection Enabled", "Certificate + Performance Report"] }
    ];

    const categories = ['Web Development', 'Mobile Development', 'AI/ML', 'Cybersecurity', 'Data Engineering', 'DevOps'];

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
            {/* Sidebar Toggle for Mobile */}
            <div className="md:hidden bg-[#2563eb] text-white p-4 flex justify-between items-center shadow-lg">
                <span className="font-bold flex items-center gap-2">
                    <LayoutDashboard size={18} /> Dashboard
                </span>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-blue-600 rounded">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[240px] bg-slate-900 text-white py-6 flex-shrink-0 z-40 transition-all`}>
                <div className="px-6 mb-8 hidden md:block">
                    <h4 className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Navigation</h4>
                </div>
                {sidebarItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => {
                            if (!item.locked) {
                                setActiveTab(item.id);
                                setIsSidebarOpen(false);
                            }
                        }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
                            padding: '0.75rem 1.5rem', border: 'none', cursor: item.locked ? 'not-allowed' : 'pointer',
                            background: activeTab === item.id ? 'rgba(37,99,235,0.2)' : 'transparent',
                            color: activeTab === item.id ? '#60a5fa' : item.locked ? '#475569' : '#94a3b8',
                            borderLeft: activeTab === item.id ? '3px solid #2563eb' : '3px solid transparent',
                            fontSize: '0.9rem', fontWeight: activeTab === item.id ? '600' : '400', textAlign: 'left'
                        }}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.locked && <Lock size={12} style={{ marginLeft: 'auto' }} />}
                    </button>
                ))}

                {/* User Info (Mobile Optimized) */}
                <div className="mt-auto px-6 py-4">
                    <div className="bg-slate-800 rounded-lg p-4">
                        <p className="font-bold text-sm text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate mb-2">{user.email}</p>
                        <div className={`text-[10px] px-2 py-1 rounded inline-block font-bold ${isPaid ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-300'}`}>
                            {isPaid ? `${user.planType} Plan` : 'Pending'}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 bg-slate-50 overflow-auto">

                {/* ─── OVERVIEW TAB ─── */}
                {activeTab === 'overview' && (
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>Welcome, {user.name}! 👋</h1>
                        <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>Here's your dashboard overview</p>

                        {/* Status Cards */}
                        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
                            <div className="glass-card" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Plan</p>
                                        <h3 style={{ color: isPaid ? 'var(--primary)' : '#f59e0b' }}>{isPaid ? user.planType : 'None'}</h3>
                                    </div>
                                    <BookOpen size={24} className="text-primary" />
                                </div>
                            </div>
                            <div className="glass-card" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Payment</p>
                                        <h3 style={{ color: isPaid ? '#22c55e' : '#f59e0b' }}>{isPaid ? 'Active' : 'Pending'}</h3>
                                    </div>
                                    <CheckCircle size={24} style={{ color: isPaid ? '#22c55e' : '#f59e0b' }} />
                                </div>
                            </div>
                            <div className="glass-card" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Project</p>
                                        <h3 style={{ fontSize: '0.95rem' }}>{hasProject ? (user.selectedProject?.title || 'Selected') : 'None'}</h3>
                                    </div>
                                    <FolderKanban size={24} className="text-primary" />
                                </div>
                            </div>
                            <div className="glass-card" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Reports</p>
                                        <h3>{reports.length}</h3>
                                    </div>
                                    <FileText size={24} className="text-primary" />
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        {!isPaid && (
                            <div className="glass-card" style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', color: 'white', marginBottom: '2rem' }}>
                                <h3 style={{ color: 'white' }}>🚀 Get Started</h3>
                                <p style={{ opacity: 0.9, marginBottom: '1rem' }}>Choose a plan and start building your project!</p>
                                <button className="btn" style={{ background: 'white', color: 'var(--primary)', fontWeight: 'bold' }} onClick={() => setActiveTab('programs')}>
                                    View Programs <ChevronRight size={16} style={{ verticalAlign: 'middle' }} />
                                </button>
                            </div>
                        )}

                        {isPaid && !hasProject && (
                            <div className="glass-card" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: '2rem' }}>
                                <h3 style={{ color: '#1e40af' }}>📂 Select Your Project</h3>
                                <p style={{ color: '#3b82f6' }}>Payment confirmed! Browse and select your project to get started.</p>
                                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('projects')}>
                                    Browse Projects <ChevronRight size={16} style={{ verticalAlign: 'middle' }} />
                                </button>
                            </div>
                        )}

                        {hasProject && deadline?.hasDeadline && !user.courseCompleted && (
                            <div className="glass-card" style={{ background: '#fefce8', border: '1px solid #fde68a', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Clock size={24} style={{ color: '#f59e0b' }} />
                                    <div>
                                        <h4 style={{ color: '#92400e' }}>Next Report Deadline</h4>
                                        <p style={{ color: '#a16207', fontSize: '0.9rem' }}>
                                            Week {deadline.currentWeek} — {deadline.daysRemaining} day{deadline.daysRemaining !== 1 ? 's' : ''} remaining
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {user.courseCompleted && (
                            <div className="glass-card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Award size={32} style={{ color: '#16a34a' }} />
                                    <div>
                                        <h4 style={{ color: '#166534', fontSize: '1.1rem', marginBottom: '0.25rem' }}>🎉 Course Completed!</h4>
                                        <p style={{ color: '#15803d', fontSize: '0.9rem', margin: 0 }}>
                                            Congratulations! You have successfully completed all required weekly submissions for your project. Your Certificate of Completion is ready to download below.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Progress Tracker */}
                        {hasProject && (
                            <div className="glass-card shadow-sm mb-8" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 m-0">Project Roadmap</h3>
                                        <p className="text-xs text-slate-400 mt-1">Real-time completion based on your submissions</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-blue-600 leading-none">
                                            {Math.round((reports.length / (user.selectedProject?.roadmap?.length || 1)) * 100)}%
                                        </span>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Progress</div>
                                    </div>
                                </div>
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-8 shadow-inner">
                                    <div style={{ 
                                        width: `${Math.min(100, (reports.length / (user.selectedProject?.roadmap?.length || 1)) * 100)}%`, 
                                        height: '100%', 
                                        background: 'linear-gradient(90deg, #2563eb, #60a5fa)',
                                        transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex flex-col p-4 bg-green-50 rounded-xl border border-green-100">
                                        <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-1">Completed</span>
                                        <span className="text-lg font-bold text-green-700">{reports.length} Phases</span>
                                    </div>
                                    <div className="flex flex-col p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">Current Focus</span>
                                        <span className="text-lg font-bold text-blue-700">Week {reports.length + 1}</span>
                                    </div>
                                    <div className="flex flex-col p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Remaining</span>
                                        <span className="text-lg font-bold text-slate-600">{Math.max(0, (user.selectedProject?.roadmap?.length || 0) - reports.length)} Steps</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Documents Section */}
                        {(user.offerLetterUrl || user.certificateUrl) && (
                            <div className="glass-card shadow-sm" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-slate-800 text-white rounded-lg flex items-center justify-center">
                                        <FileText size={16} />
                                    </div>
                                    <h3 className="m-0 text-lg font-bold">Official Documents</h3>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    {user.offerLetterUrl && (
                                        <a href={`${API_URL}${user.offerLetterUrl}`} target="_blank" className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
                                            <Download size={18} /> Offer Letter
                                        </a>
                                    )}
                                    {user.certificateUrl && (
                                        <a href={`${API_URL}${user.certificateUrl}`} target="_blank" className="flex items-center gap-3 px-6 py-3 bg-blue-600 border border-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg">
                                            <Award size={18} /> Download Certificate
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── PROGRAMS TAB ─── */}
                {activeTab === 'programs' && (
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>Programs</h1>
                        <p style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>Choose your training plan</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '2rem' }}>
                            This is a project-based training program. No mentorship or live sessions included.
                        </p>

                        {isPaid ? (
                            <div className="glass-card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <CheckCircle size={24} style={{ color: '#22c55e' }} />
                                    <div>
                                        <h3 style={{ color: '#166534', margin: 0 }}>Plan Active: {user.planType} Program</h3>
                                        <p style={{ color: '#15803d', fontSize: '0.9rem', margin: 0 }}>Your payment is confirmed. Head to Projects to get started!</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-2" style={{ maxWidth: '800px' }}>
                                {plans.map((plan, idx) => (
                                    <div key={idx} className="glass-card" style={{
                                        background: idx === 1 ? '#0f172a' : 'white',
                                        color: idx === 1 ? 'white' : 'inherit',
                                        border: idx === 1 ? '2px solid var(--primary)' : '1px solid #e2e8f0'
                                    }}>
                                        {idx === 1 && <span style={{ background: '#2563eb', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 'bold' }}>POPULAR</span>}
                                        <h3 style={{ marginTop: idx === 1 ? '0.5rem' : 0 }}>{plan.name}</h3>
                                        <p style={{ fontSize: '0.9rem', color: idx === 1 ? '#94a3b8' : 'var(--secondary)' }}>{plan.duration}</p>
                                        <h2 style={{ color: idx === 1 ? '#60a5fa' : 'var(--primary)', fontSize: '2rem', margin: '1rem 0' }}>{plan.priceDisplay}</h2>
                                        <div style={{ borderTop: `1px solid ${idx === 1 ? '#334155' : '#f1f5f9'}`, paddingTop: '1rem', marginBottom: '1.5rem' }}>
                                            {plan.features.map((f, fi) => (
                                                <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.5rem', color: idx === 1 ? '#e2e8f0' : '#475569' }}>
                                                    <CheckCircle size={14} style={{ color: '#22c55e', flexShrink: 0 }} /> {f}
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            style={{ width: '100%', opacity: paymentLoading ? 0.7 : 1 }}
                                            onClick={() => handleEnrollPayment(plan)}
                                            disabled={paymentLoading}
                                        >
                                            {paymentLoading ? 'Processing...' : 'Enroll Now'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Payment Modal */}
                        {selectedPlan && (
                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                                <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '500px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                                    <button 
                                        onClick={() => setSelectedPlan(null)} 
                                        style={{ position: 'sticky', top: '0', float: 'right', background: 'white', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8', zIndex: 10, padding: '0 0.5rem', borderRadius: '50%' }}
                                    >
                                        &times;
                                    </button>
                                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)', marginTop: '0.5rem' }}>Complete Enrollment</h2>
                                    <p style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>
                                        You selected the <strong>{selectedPlan.name}</strong>. Provide your UPI Transaction ID to secure your spot.
                                    </p>
                                    
                                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '1rem', color: '#64748b', marginBottom: '1rem' }}>Scan QR to Pay: {selectedPlan.priceDisplay}</div>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <img 
                                                src={upiQr} 
                                                alt="UPI QR Code" 
                                                style={{ width: '220px', height: 'auto', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }} 
                                            />
                                        </div>
                                        <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fecaca', textAlign: 'left', fontSize: '0.8rem', color: '#991b1b' }}>
                                            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <AlertCircle size={14} /> Important Terms & Conditions:
                                            </p>
                                            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                                <li>Payment is non-refundable once submitted.</li>
                                                <li>False payment claims will lead to a <strong>Permanent Ban</strong>.</li>
                                                <li>Ensure the screenshot shows the Transaction ID clearly.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmitPayment}>
                                        <div className="form-group" style={{ marginBottom: '1rem', textAlign: 'left' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155' }}>1. UPI Transaction ID / Ref No.</label>
                                            <input 
                                                type="text" 
                                                value={transactionId}
                                                onChange={(e) => setTransactionId(e.target.value)}
                                                placeholder="e.g. 308728938722" 
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                                                required
                                                minLength="8"
                                            />
                                        </div>

                                        <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#334155' }}>2. Upload Payment Screenshot</label>
                                            <div style={{ border: '2px dashed #cbd5e1', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', background: paymentScreenshot ? '#f0fdf4' : 'white' }}>
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={(e) => setPaymentScreenshot(e.target.files[0])}
                                                    required
                                                    style={{ display: 'none' }}
                                                    id="screenshot-upload"
                                                />
                                                <label htmlFor="screenshot-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Upload size={24} style={{ color: paymentScreenshot ? '#22c55e' : '#64748b' }} />
                                                    <span style={{ fontSize: '0.9rem', color: paymentScreenshot ? '#166534' : '#64748b' }}>
                                                        {paymentScreenshot ? `Selected: ${paymentScreenshot.name}` : 'Click to select image'}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary" 
                                            style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                                            disabled={paymentLoading}
                                        >
                                            {paymentLoading ? 'Submitting...' : 'Submit Payment for Verification'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── PROJECTS TAB ─── */}
                {activeTab === 'projects' && isPaid && (
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>Project Catalog</h1>
                        <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>
                            {hasProject ? `Your project: ${user.selectedProject?.title}` : 'Browse and select your project (selection is final)'}
                        </p>

                        {hasProject ? (
                            <div>
                                <div className="glass-card" style={{ background: 'white', border: '2px solid var(--primary)', marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <Lock size={18} className="text-primary" />
                                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Locked Project</span>
                                    </div>
                                    <h2>{user.selectedProject?.title}</h2>
                                    <p style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>{user.selectedProject?.description}</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                        {user.selectedProject?.techStack?.map((t, i) => (
                                            <span key={i} style={{ background: '#eff6ff', color: '#2563eb', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: '500' }}>{t}</span>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
                                        <span><strong>Category:</strong> {user.selectedProject?.category}</span>
                                        <span><strong>Difficulty:</strong> {user.selectedProject?.difficulty}</span>
                                        <span><strong>Duration:</strong> {user.selectedProject?.estimatedWeeks} weeks</span>
                                    </div>

                                    {/* Roadmap Section */}
                                    {user.selectedProject?.roadmap && user.selectedProject.roadmap.length > 0 && (
                                        <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1e293b' }}>
                                                <TrendingUp size={22} className="text-primary" />
                                                Implementation Roadmap
                                            </h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                                {user.selectedProject.roadmap.map((item, index) => {
                                                    const isCompleted = index < reports.length;
                                                    const isCurrent = index === reports.length;
                                                    const isLocked = index > reports.length;
                                                    
                                                    return (
                                                        <div key={index} style={{ 
                                                            padding: '1.5rem', 
                                                            background: isCompleted ? '#f0fdf4' : isCurrent ? '#eff6ff' : '#f8fafc', 
                                                            borderRadius: '1.25rem', 
                                                            border: `2px solid ${isCompleted ? '#bbf7d0' : isCurrent ? '#3b82f6' : '#e2e8f0'}`,
                                                            position: 'relative',
                                                            opacity: isLocked ? 0.7 : 1,
                                                            transition: 'all 0.3s'
                                                        }}>
                                                            <div style={{ 
                                                                position: 'absolute', top: '-12px', left: '20px',
                                                                background: isCompleted ? '#22c55e' : isCurrent ? '#2563eb' : '#94a3b8', 
                                                                color: 'white', padding: '2px 12px', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold'
                                                            }}>
                                                                {isCompleted ? '✓ COMPLETED' : isCurrent ? '⏳ CURRENT PHASE' : '🔒 LOCKED'}
                                                            </div>
                                                            <h4 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '0.5rem', marginTop: '0.5rem' }}>{item.step}</h4>
                                                            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>{item.description}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {user.offerLetterUrl && (
                                    <a href={`${API_URL}${user.offerLetterUrl}`} target="_blank" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Download size={16} /> Download Offer Letter
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div>
                                {/* Filters */}
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                                    <select
                                        value={projectFilter.category}
                                        onChange={e => setProjectFilter({ ...projectFilter, category: e.target.value })}
                                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <select
                                        value={projectFilter.difficulty}
                                        onChange={e => setProjectFilter({ ...projectFilter, difficulty: e.target.value })}
                                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="">All Difficulties</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                        <option value="Expert">Expert</option>
                                    </select>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem', alignSelf: 'center' }}>{projects.length} projects found</span>
                                </div>

                                {/* Project Grid */}
                                <div className="grid grid-3">
                                    {projects.map(project => (
                                        <div key={project._id} className="glass-card" style={{ background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
                                            onClick={() => setSelectedProjectDetail(project)}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                <span style={{
                                                    fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: 'bold',
                                                    background: project.difficulty === 'Expert' ? '#fef2f2' : project.difficulty === 'Advanced' ? '#eff6ff' : '#f0fdf4',
                                                    color: project.difficulty === 'Expert' ? '#dc2626' : project.difficulty === 'Advanced' ? '#2563eb' : '#16a34a'
                                                }}>{project.difficulty}</span>
                                                {project.planRequired === 'Advanced' && user.planType !== 'Advanced' && (
                                                    <Lock size={14} style={{ color: '#94a3b8' }} />
                                                )}
                                            </div>
                                            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{project.title}</h4>
                                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {project.description}
                                            </p>
                                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                                {project.techStack.slice(0, 3).map((t, i) => (
                                                    <span key={i} style={{ background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.7rem', color: '#475569' }}>{t}</span>
                                                ))}
                                                {project.techStack.length > 3 && <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>+{project.techStack.length - 3}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Project Detail Modal */}
                                {selectedProjectDetail && (
                                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                                        onClick={() => { setSelectedProjectDetail(null); setConfirmingProject(null); }}
                                    >
                                        <div className="glass-card" style={{ background: 'white', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
                                            <h2 style={{ marginBottom: '0.5rem' }}>{selectedProjectDetail.title}</h2>
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                                                <span>{selectedProjectDetail.category}</span>
                                                <span style={{ fontWeight: 'bold', color: selectedProjectDetail.difficulty === 'Expert' ? '#dc2626' : '#2563eb' }}>{selectedProjectDetail.difficulty}</span>
                                                <span>{selectedProjectDetail.estimatedWeeks} weeks</span>
                                            </div>
                                            <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem', lineHeight: '1.7' }}>{selectedProjectDetail.description}</p>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Tech Stack</h4>
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    {selectedProjectDetail.techStack.map((t, i) => (
                                                        <span key={i} style={{ background: '#eff6ff', color: '#2563eb', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem' }}>{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Learning Outcomes</h4>
                                                {selectedProjectDetail.learningOutcomes.map((o, i) => (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#475569' }}>
                                                        <CheckCircle size={14} style={{ color: '#22c55e' }} /> {o}
                                                    </div>
                                                ))}
                                            </div>
                                            {selectedProjectDetail.planRequired === 'Advanced' && user.planType !== 'Advanced' ? (
                                                <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.9rem' }}>
                                                    <Lock size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                                                    This project requires the Advanced plan.
                                                </div>
                                            ) : confirmingProject === selectedProjectDetail._id ? (
                                                <div>
                                                    <div style={{ background: '#fefce8', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #fde68a' }}>
                                                        <p style={{ fontWeight: 'bold', color: '#92400e', marginBottom: '0.5rem' }}>⚠️ Are you sure?</p>
                                                        <p style={{ color: '#a16207', fontSize: '0.85rem', margin: 0 }}>You <strong>cannot change</strong> your project once selected. This is final.</p>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleSelectProject(selectedProjectDetail._id)}>
                                                            Yes, Confirm Selection
                                                        </button>
                                                        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setConfirmingProject(null)}>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setConfirmingProject(selectedProjectDetail._id)}>
                                                    Select This Project
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── REPORTS TAB ─── */}
                {activeTab === 'reports' && hasProject && (
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>Weekly Reports</h1>
                        <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>Submit your weekly progress and view analysis</p>

                        {deadline?.hasDeadline && !user.courseCompleted && (
                            <div className="glass-card" style={{ background: '#fefce8', border: '1px solid #fde68a', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Calendar size={20} style={{ color: '#f59e0b' }} />
                                <span style={{ color: '#92400e', fontWeight: '600' }}>
                                    Week {deadline.currentWeek} — Deadline in {deadline.daysRemaining} day{deadline.daysRemaining !== 1 ? 's' : ''} | {deadline.totalSubmissions} submitted
                                </span>
                            </div>
                        )}

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Submit Form or Completed/Wait State */}
                            <div className="w-full lg:w-1/3">
                                <div className="glass-card shadow-sm sticky top-24" style={{ background: 'white', border: '1px solid #e2e8f0', height: 'fit-content' }}>
                                {user.courseCompleted ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Award size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">Program Completed</h3>
                                        <p className="text-sm text-slate-500">All milestones reached. Great work!</p>
                                    </div>
                                ) : reports.length >= (deadline?.currentWeek || 0) && (deadline?.currentWeek > 0) ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">Report Submitted</h3>
                                        <p className="text-sm text-slate-500">Wait for next window in {deadline?.daysRemaining}d.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                                                <Upload size={16} />
                                            </div>
                                            <h3 className="m-0 text-lg font-bold">New Report</h3>
                                        </div>
                                        <form onSubmit={handleSubmitReport}>
                                            <textarea
                                                placeholder="What did you implement this week?"
                                                required
                                                className="w-full h-48 p-4 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm focus:border-blue-500 focus:bg-white outline-none transition-all mb-4 resize-none"
                                                value={textContent}
                                                onChange={e => setTextContent(e.target.value)}
                                            />
                                            <button type="submit" className="btn btn-primary w-full py-3 flex items-center justify-center gap-2">
                                                Submit Week {reports.length + 1} <ChevronRight size={16} />
                                            </button>
                                        </form>
                                    </>
                                )}
                                </div>
                            </div>

                            {/* Report History */}
                            <div className="w-full lg:w-2/3 flex flex-col gap-6">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>Submission History</h4>
                                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{reports.length} Total Submissions</span>
                                </div>
                                
                                {reports.length === 0 ? (
                                    <div className="glass-card text-center py-16" style={{ background: 'white', border: '1px dashed #cbd5e1' }}>
                                        <div className="text-slate-300 mb-4">
                                            <FileText size={48} className="mx-auto" />
                                        </div>
                                        <h4 className="text-slate-600 font-bold mb-1">No Reports Yet</h4>
                                        <p className="text-slate-400 text-sm">Submit your first weekly report to begin evaluation.</p>
                                    </div>
                                ) : (
                                    reports.map((report, idx) => (
                                        <div key={idx} className="glass-card overflow-hidden" style={{ background: 'white', border: '1px solid #e2e8f0', padding: 0 }}>
                                            {/* Minimal Header */}
                                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-bold text-blue-600 shadow-sm">
                                                        W{report.weekNumber}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-800 m-0">Week {report.weekNumber} Analysis</h4>
                                                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                                                            <Calendar size={10} /> {new Date(report.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {/* Compact Stats Row */}
                                                    <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-white rounded-lg border border-slate-100">
                                                        <div className="text-center">
                                                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Perf.</div>
                                                            <div className="text-sm font-black text-blue-600">{report.analysis?.performanceScore}%</div>
                                                        </div>
                                                        <div className="w-px h-6 bg-slate-100"></div>
                                                        <div className="text-center">
                                                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Sim.</div>
                                                            <div className="text-sm font-black text-orange-500">{report.analysis?.similarityScore}%</div>
                                                        </div>
                                                    </div>
                                                    <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[11px] font-bold flex items-center gap-1">
                                                        <CheckCircle size={12} /> Evaluated
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Feedback Content */}
                                            <div className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                                    {/* Mobile Only Stats */}
                                                    <div className="sm:hidden grid grid-cols-2 gap-3 mb-4">
                                                        <div className="p-3 bg-blue-50 rounded-lg flex flex-col items-center">
                                                            <span className="text-[10px] uppercase font-bold text-blue-400">Performance</span>
                                                            <span className="text-lg font-black text-blue-600">{report.analysis?.performanceScore}%</span>
                                                        </div>
                                                        <div className="p-3 bg-orange-50 rounded-lg flex flex-col items-center">
                                                            <span className="text-[10px] uppercase font-bold text-orange-400">Similarity</span>
                                                            <span className="text-lg font-black text-orange-600">{report.analysis?.similarityScore}%</span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                                        <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <Zap size={12} className="text-blue-500" /> Professional Feedback
                                                        </h5>
                                                        <ul className="m-0 p-0 list-none space-y-3">
                                                            {report.analysis?.feedback?.length > 0 ? (
                                                                report.analysis.feedback.map((fb, fi) => (
                                                                    <li key={fi} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                                                                        <span className="text-blue-400 mt-0.5">•</span> {fb}
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li className="text-xs text-slate-400 italic">No feedback available.</li>
                                                            )}
                                                        </ul>
                                                    </div>

                                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                                        <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <Shield size={12} className="text-green-500" /> Authenticity Report
                                                        </h5>
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${report.analysis?.similarityScore < 30 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                                <Shield size={24} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-700 mb-0.5">
                                                                    {report.analysis?.similarityScore < 30 ? 'Verified Original' : 'Review Required'}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 italic">
                                                                    {report.analysis?.similarityScore < 30 ? 'Content meets industry standards.' : `Matched with ${report.analysis?.source || 'external sources'}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── PLAGIARISM TAB ─── */}
                {activeTab === 'plagiarism' && hasProject && (
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>Plagiarism Checker</h1>
                        <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>Check your code or GitHub link for originality</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="glass-card shadow-sm" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                                        <Shield size={16} />
                                    </div>
                                    <h3 className="m-0 text-lg font-bold">Submit for Check</h3>
                                </div>
                                <textarea
                                    placeholder="Paste your code or enter a GitHub repository URL..."
                                    className="w-full h-64 p-4 rounded-xl border-2 border-slate-100 bg-slate-50 text-sm font-mono focus:border-blue-500 focus:bg-white outline-none transition-all mb-6 resize-none"
                                    value={plagiarismInput}
                                    onChange={e => setPlagiarismInput(e.target.value)}
                                />
                                <button className="btn btn-primary w-full py-3 flex items-center justify-center gap-2" onClick={handlePlagiarismCheck}>
                                    <Zap size={16} /> Run Plagiarism Check
                                </button>
                            </div>

                            <div className="glass-card shadow-sm" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center">
                                        <TrendingUp size={16} />
                                    </div>
                                    <h3 className="m-0 text-lg font-bold">Analysis Results</h3>
                                </div>
                                {plagiarismResult ? (
                                    <div className="py-2">
                                        <div className="text-center mb-8">
                                            <div className={`w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center border-4 ${plagiarismResult.plagiarismScore < 30 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                                <div className="text-center">
                                                    <div className={`text-3xl font-black ${plagiarismResult.plagiarismScore < 30 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {plagiarismResult.plagiarismScore}%
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Similarity</div>
                                                </div>
                                            </div>
                                            <p className={`font-bold ${plagiarismResult.plagiarismScore < 30 ? 'text-green-600' : 'text-red-600'} flex items-center justify-center gap-2`}>
                                                {plagiarismResult.plagiarismScore < 30 ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                                {plagiarismResult.plagiarismScore < 30 ? 'High Originality' : 'Similarity Warning'}
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <p className="text-sm font-bold text-slate-700 mb-2">Performance: {plagiarismResult.performanceScore}%</p>
                                                <div className="space-y-1">
                                                    {plagiarismResult.strengths?.map((s, i) => <p key={i} className="text-xs text-green-600 m-0">✓ {s}</p>)}
                                                    {plagiarismResult.improvements?.map((s, i) => <p key={i} className="text-xs text-orange-500 m-0">⚡ {s}</p>)}
                                                </div>
                                            </div>
                                            {plagiarismResult.source && plagiarismResult.plagiarismScore > 20 && (
                                                <p className="text-[11px] text-slate-400 text-center italic">Potential Match: {plagiarismResult.source}</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-20 text-slate-300">
                                        <Shield size={64} className="mx-auto mb-4 opacity-20" />
                                        <p className="text-slate-400 text-sm">Submit your code to see detailed analysis</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── REFERRAL TAB ─── */}
                {activeTab === 'referral' && (
                    <div>
                        <h1 style={{ marginBottom: '0.5rem' }}>Referral Program</h1>
                        <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>Earn rewards by referring friends</p>

                        <div className="glass-card text-center" style={{ background: 'white', border: '1px solid #e2e8f0', padding: '4rem' }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.5rem',
                                background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid #fbbf24'
                            }}>
                                <Users2 size={36} style={{ color: '#f59e0b' }} />
                            </div>
                            <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.4rem 1.5rem', borderRadius: '2rem', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                🚧 Coming Soon
                            </span>
                            <h2 style={{ marginTop: '1.5rem', color: '#1e293b' }}>Referral Program</h2>
                            <p style={{ color: '#64748b', maxWidth: '400px', margin: '0.5rem auto 0' }}>
                                We're building an exciting referral program where you can earn rewards by inviting friends to TVP IT Solutions. Stay tuned!
                            </p>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default Dashboard;
