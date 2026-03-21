const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Report = require('../models/Report');

// Middleware to check if admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    next();
};

// Get quick lightweight stats for Admin Panel
router.get('/stats', [auth, isAdmin], async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const paidUsers = await User.countDocuments({ role: 'user', paymentStatus: 'paid' });
        
        // Sum total payments from active plans
        const users = await User.find({ role: 'user', paymentStatus: 'paid' }, 'planType');
        let totalAmount = 0;
        users.forEach(u => {
            if (u.planType === 'Advanced') totalAmount += 1999;
            else if (u.planType === 'Foundation') totalAmount += 1099;
        });

        const completedCourses = await User.countDocuments({ role: 'user', courseCompleted: true });

        res.json({
            totalUsers,
            paidUsers,
            totalAmount,
            completedCourses
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get pending payments
router.get('/pending-payments', [auth, isAdmin], async (req, res) => {
    try {
        const pendingUsers = await User.find({ paymentStatus: 'pending' }).select('name email upiTransactionId requestedPlan paymentScreenshotUrl createdAt');
        res.json(pendingUsers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
