const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    const { name, email, phone, password, referrerCode } = req.body;

    // Input validation
    if (!name || !email || !password) {
        return res.status(400).json({ msg: 'Name, email, and password are required' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        // Generate unique referral code
        const referralCode = name.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 10000);
        
        // Find referrer if exists
        let referredBy = null;
        if (referrerCode) {
            const referrer = await User.findOne({ referralCode: referrerCode });
            if (referrer) referredBy = referrer._id;
        }

        user = new User({ 
            name, 
            email, 
            phone: phone || '', 
            password,
            referralCode,
            referredBy
        });
        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    planType: user.planType,
                    paymentStatus: user.paymentStatus,
                    selectedProject: user.selectedProject,
                    courseCompleted: user.courseCompleted
                }
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Email and password are required' });
    }

    try {
        let user = await User.findOne({ email }).populate('selectedProject');
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    planType: user.planType,
                    paymentStatus: user.paymentStatus,
                    selectedProject: user.selectedProject,
                    courseCompleted: user.courseCompleted,
                    offerLetterUrl: user.offerLetterUrl,
                    certificateUrl: user.certificateUrl
                }
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get User Data
router.get('/me', require('../middleware/auth'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').populate('selectedProject');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
