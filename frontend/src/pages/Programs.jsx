import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Info, Shield, CreditCard, Clock, Zap, Upload, AlertCircle } from 'lucide-react';
import upiQr from '../assets/upi_qr.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Programs = () => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [transactionId, setTransactionId] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    const navigate = useNavigate();

    const plans = [
        {
            name: "Foundation Program",
            duration: "4 Months",
            price: 1099,
            priceDisplay: "₹1,099",
            badge: "Foundation",
            features: [
                "1 Advanced Industry-Level Project",
                "Weekly Evaluation System",
                "Plagiarism Detection Enabled",
                "Certificate of Completion"
            ],
            desc: "Build one advanced, industry-level project from scratch. Weekly evaluations ensure consistent progress and original work.",
            highlight: false
        },
        {
            name: "Advanced Program",
            duration: "6 Months",
            price: 1999,
            priceDisplay: "₹1,999",
            badge: "Advanced",
            features: [
                "1 Highly Advanced Project (Production-Level)",
                "Deep Evaluation & Code Quality Checks",
                "Plagiarism Detection Enabled",
                "Certificate + Performance Report"
            ],
            desc: "Build one production-level application with deep code quality evaluations. Receive a detailed performance report alongside your certificate.",
            highlight: true
        }
    ];

    // Open UPI Payment Modal
    const handleEnroll = (plan) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        setSelectedPlan(plan);
        setTransactionId('');
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        if (!paymentScreenshot) {
            alert('Please upload a payment screenshot');
            return;
        }
        setSubmitLoading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('transactionId', transactionId);
            formData.append('planType', selectedPlan.badge);
            formData.append('amount', selectedPlan.price);
            formData.append('screenshot', paymentScreenshot);

            await axios.post(`${API_URL}/api/payment/submit-upi`, formData, {
                headers: { 
                    'x-auth-token': token
                }
            });
            alert('Payment submitted successfully! Our team will verify it within 24 hours.');
            navigate('/dashboard');
        } catch(err) {
            alert(err.response?.data?.error || 'Payment submission failed. Please try again.');
        } finally {
            setSubmitLoading(false);
            setSelectedPlan(null);
            setPaymentScreenshot(null);
        }
    };

    return (
        <div className="programs-page">
            {/* Header */}
            <section className="section" style={{ background: '#f8fafc', paddingBottom: '2rem' }}>
                <div className="container text-center">
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Our Professional <span className="text-gradient">Programs</span></h1>
                    <p style={{ color: 'var(--secondary)', maxWidth: '650px', margin: '0 auto', marginBottom: '1rem' }}>
                        Select the plan that matches your goals. Each program is designed around building one real-world project independently.
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', maxWidth: '600px', margin: '0 auto' }}>
                        This is a project-based training program focused on building real-world applications. No mentorship or live sessions included.
                    </p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    {/* Highlight: Independent Project */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
                            color: 'white',
                            padding: '2rem 3rem',
                            borderRadius: '1rem',
                            textAlign: 'center',
                            marginBottom: '4rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            flexWrap: 'wrap'
                        }}
                    >
                        <Zap size={28} />
                        <h3 style={{ color: 'white', margin: 0, fontSize: '1.3rem' }}>
                            You will independently build 1 major project
                        </h3>
                    </motion.div>

                    {/* Plan Cards */}
                    <div className="grid grid-2" style={{ maxWidth: '900px', margin: '0 auto', marginBottom: '4rem' }}>
                        {plans.map((plan, idx) => (
                            <motion.div
                                key={idx}
                                className="glass-card"
                                style={{
                                    background: plan.highlight ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'white',
                                    color: plan.highlight ? 'white' : 'inherit',
                                    border: plan.highlight ? '2px solid var(--primary)' : '2px solid transparent',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                whileHover={{ borderColor: 'var(--primary)', y: -5 }}
                            >
                                {plan.highlight && (
                                    <span style={{
                                        position: 'absolute', top: '1rem', right: '-2rem',
                                        background: 'var(--primary)', color: 'white',
                                        padding: '0.25rem 3rem', transform: 'rotate(45deg)',
                                        fontSize: '0.75rem', fontWeight: 'bold'
                                    }}>
                                        POPULAR
                                    </span>
                                )}

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: plan.highlight ? '#94a3b8' : 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {plan.badge}
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.25rem' }}>{plan.name}</div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '1.5rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: plan.highlight ? '#94a3b8' : '#64748b' }}>
                                            <Clock size={16} /> {plan.duration}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: plan.highlight ? '#60a5fa' : 'var(--primary)' }}>
                                            {plan.priceDisplay}
                                        </div>
                                    </div>
                                </div>

                                <p style={{ color: plan.highlight ? '#cbd5e1' : 'var(--secondary)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                    {plan.desc}
                                </p>

                                <div style={{ padding: '1.5rem 0', borderTop: `1px solid ${plan.highlight ? '#334155' : '#f1f5f9'}`, marginBottom: '1.5rem' }}>
                                    {plan.features.map((feature, fIdx) => (
                                        <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: plan.highlight ? '#e2e8f0' : '#475569', marginBottom: '0.75rem' }}>
                                            <CheckCircle size={16} style={{ color: '#22c55e', flexShrink: 0 }} /> {feature}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: plan.highlight ? '#2563eb' : 'var(--primary)',
                                        opacity: loading === plan.price ? 0.7 : 1,
                                        cursor: loading === plan.price ? 'wait' : 'pointer'
                                    }}
                                    onClick={() => handleEnroll(plan)}
                                >
                                    Enroll Now
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Trust Elements */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '3rem',
                        flexWrap: 'wrap',
                        marginBottom: '4rem',
                        padding: '2rem',
                        background: '#f0f9ff',
                        borderRadius: '1rem',
                        border: '1px solid #bae6fd'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: '600', color: '#0369a1' }}>
                            <Shield size={20} style={{ color: '#2563eb' }} /> Secure Direct UPI Transfer
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: '600', color: '#0369a1' }}>
                            <CreditCard size={20} style={{ color: '#2563eb' }} /> Instant confirmation after payment
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: '600', color: '#0369a1' }}>
                            <CheckCircle size={20} style={{ color: '#22c55e' }} /> No hidden charges
                        </div>
                    </div>

                    {/* College Contact Card */}
                    <div className="glass-card" style={{ marginTop: '2rem', padding: '4rem', background: 'var(--dark)', color: 'white', borderRadius: '2rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'var(--primary)', opacity: '0.1', borderRadius: '50%' }}></div>
                        <div style={{ position: 'relative', zIndex: 1 }} className="text-center">
                            <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem' }}>For Colleges & Universities</h2>
                            <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
                                Are you looking to provide professional-grade project training for your students? We offer tailored bulk programs with special administrative access for faculty.
                            </p>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <a href="mailto:contact@threatviper.com" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                                    Email us for Partnership
                                </a>
                                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                    Contact: <span style={{ color: 'var(--primary)' }}>contact@threatviper.com</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

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
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
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
                                        id="screenshot-upload-prog"
                                    />
                                    <label htmlFor="screenshot-upload-prog" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
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
                                disabled={submitLoading}
                            >
                                {submitLoading ? 'Submitting...' : 'Submit Payment for Verification'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer style={{ background: 'white', borderTop: '1px solid #e2e8f0', padding: '4rem 0' }}>
                <div className="container text-center">
                    <p style={{ color: 'var(--secondary)' }}>&copy; 2026 TVP IT Solutions. Empowering the next generation of tech talent.</p>
                </div>
            </footer>
        </div>
    );
};

export default Programs;
