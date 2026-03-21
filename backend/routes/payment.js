const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for payment screenshots
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/payments/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `pay-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// POST /submit-upi
router.post('/submit-upi', auth, upload.single('screenshot'), async (req, res) => {
    const { transactionId, planType, amount } = req.body || {};

    if (!transactionId || transactionId.trim().length < 8) {
        return res.status(400).json({ error: 'Please enter a valid Transaction ID' });
    }
    
    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a payment screenshot' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        user.paymentStatus = 'pending';
        user.upiTransactionId = transactionId.trim();
        user.requestedPlan = planType;
        user.paymentScreenshotUrl = `/uploads/payments/${req.file.filename}`;
        await user.save();

        // Send email to admin
        const adminHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #2563eb;">New Payment Approval Request</h2>
                <p><strong>User:</strong> ${user.name} (${user.email})</p>
                <p><strong>Plan Requested:</strong> ${planType} (Rs. ${amount})</p>
                <p><strong>Transaction ID:</strong> <span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">${transactionId}</span></p>
                <p><strong>Screenshot:</strong> <a href="${process.env.BACKEND_URL || 'http://localhost:5000'}${user.paymentScreenshotUrl}" target="_blank">View Screenshot</a></p>
                <p>Please log in to the Admin Dashboard to verify and approve this transaction.</p>
            </div>
        `;
        await sendEmail('contact@threatviper.com', 'Action Required: New Payment Approval', adminHtml);
        
        // Send email to user
        const userHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #f59e0b;">Payment Verification Pending ⏳</h2>
                <p>Hi <strong>${user.name}</strong>,</p>
                <p>We successfully received your UPI Transaction ID (<strong>${transactionId}</strong>) for the <strong>${planType} Program</strong>.</p>
                <p>Our team will manually verify this within 24 hours. Your dashboard will automatically unlock once approved.</p>
                <br>
                <p style="color: #64748b; font-size: 12px;">TVP IT Solutions — Part of Threat Viper Security</p>
            </div>
        `;
        await sendEmail(user.email, 'Verification Pending - TVP IT Solutions', userHtml);

        res.json({ success: true, message: 'Payment submitted for review' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /approve/:userId (Admin only)
router.post('/approve/:userId', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only access' });

    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.paymentStatus = 'paid';
        user.planType = user.requestedPlan;
        
        // Handle Referral Reward
        if (user.referredBy) {
            const referrer = await User.findById(user.referredBy);
            // Cap at 5 referrals and check if referrer exists
            if (referrer && referrer.referralCount < 5) {
                referrer.referralCount += 1;
                // Reward logic: 20 for Foundation (1099), 30 for Advanced (1999)
                const rewardAmount = user.planType === 'Advanced' ? 30 : 20;
                referrer.totalReferralEarnings += rewardAmount; 
                await referrer.save();
            }
        }
        
        await user.save();

        // Send approval / welcome email
        const userHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #2563eb; margin: 0;">TVP IT SOLUTIONS</h1>
                    <p style="color: #64748b; font-size: 14px; margin: 5px 0;">Empowering Your Tech Career</p>
                </div>
                
                <h2 style="color: #22c55e; border-bottom: 2px solid #f0fdf4; padding-bottom: 10px;">Payment Approved! 🎉</h2>
                <p>Hi <strong>${user.name}</strong>,</p>
                <p>Great news! Your payment for the <strong>${user.planType} Program</strong> has been successfully verified.</p>
                
                <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                    <h3 style="margin-top: 0; color: #166534;">Your Dashboard is Unlocked 🔓</h3>
                    <p style="color: #15803d; line-height: 1.6;">You now have full access to our project catalog and evaluation systems.</p>
                    <ul style="color: #15803d; padding-left: 20px; line-height: 1.6;">
                        <li><strong>Browse & Select:</strong> Choose your primary project from the catalog.</li>
                        <li><strong>Lock Project:</strong> Confirm your choice to generate your official Offer Letter.</li>
                        <li><strong>Start Building:</strong> Begin work and submit your first weekly report.</li>
                    </ul>
                </div>

                <p>If you have any questions, simply reply to this email or reach out to our team at any time.</p>
                
                <p style="margin-top: 30px;">Welcome to the family!</p>
                <br>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
                    <p style="margin: 0; font-weight: bold;">Vaibhav</p>
                    <p style="margin: 0; color: #64748b; font-size: 13px;">Founder & CEO, TVP IT Solutions</p>
                </div>
            </div>
        `;
        await sendEmail(user.email, 'Payment Approved - Welcome to TVP IT Solutions!', userHtml);

        res.json({ success: true, message: 'Payment approved', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
