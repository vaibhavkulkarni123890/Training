const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { subscribeToPush, VAPID_KEYS } = require('../services/pushNotificationService');

// Get VAPID public key for frontend
router.get('/vapid-public-key', (req, res) => {
    res.json({
        success: true,
        publicKey: VAPID_KEYS.publicKey
    });
});

// Subscribe to push notifications
router.post('/subscribe', auth, async (req, res) => {
    try {
        const { subscription } = req.body;
        
        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription data'
            });
        }

        const success = await subscribeToPush(req.user.id, subscription);
        
        if (success) {
            res.json({
                success: true,
                message: 'Push notifications enabled successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to enable push notifications'
            });
        }
    } catch (error) {
        console.error('Push subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', auth, async (req, res) => {
    try {
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user.id, {
            $unset: { pushSubscription: 1 }
        });
        
        res.json({
            success: true,
            message: 'Push notifications disabled'
        });
    } catch (error) {
        console.error('Push unsubscribe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disable push notifications'
        });
    }
});

module.exports = router;