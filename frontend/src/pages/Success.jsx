import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const Success = () => {
    const [searchParams] = useSearchParams();
    const plan = searchParams.get('plan') || 'Your Selected Plan';
    const amount = searchParams.get('amount') || '';

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top right, #e0f2fe 0%, #f0fdf4 50%, #ffffff 100%)' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="glass-card"
                style={{ maxWidth: '550px', width: '100%', margin: '2rem', background: 'white', textAlign: 'center', padding: '3rem' }}
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    style={{
                        width: '80px', height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2rem'
                    }}
                >
                    <CheckCircle size={40} style={{ color: 'white' }} />
                </motion.div>

                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#0f172a' }}>
                    Payment Successful! 🎉
                </h1>

                {/* Plan Details */}
                <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#166534', marginBottom: '0.5rem' }}>
                        {plan}
                    </p>
                    {amount && (
                        <p style={{ fontSize: '0.95rem', color: '#15803d' }}>
                            Amount Paid: ₹{Number(amount).toLocaleString('en-IN')}
                        </p>
                    )}
                </div>

                <p style={{ fontSize: '1.05rem', color: 'var(--secondary)', marginBottom: '2rem', lineHeight: '1.7' }}>
                    You will receive onboarding instructions within 24 hours.
                </p>

                <div style={{
                    background: '#f8fafc',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    marginBottom: '2rem',
                    fontSize: '0.9rem',
                    color: '#64748b'
                }}>
                    <p>A confirmation email will be sent to your registered email address with all the details about your program and next steps.</p>
                </div>

                <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
                    Go to Home <ArrowRight size={18} />
                </Link>
            </motion.div>
        </div>
    );
};

export default Success;
