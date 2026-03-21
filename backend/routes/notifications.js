const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
} = require('../services/notificationService');

// Get user notifications
router.get('/', auth, async (req, res) => {
    try {
        const { limit = 20, unreadOnly = false } = req.query;
        const notifications = await getUserNotifications(
            req.user.id, 
            parseInt(limit), 
            unreadOnly === 'true'
        );
        
        res.json({
            success: true,
            notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
        });
    }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
    try {
        const count = await getUnreadCount(req.user.id);
        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread count'
        });
    }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
    try {
        const success = await markAsRead(req.params.id, req.user.id);
        if (success) {
            res.json({
                success: true,
                message: 'Notification marked as read'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
});

// Mark all notifications as read
router.patch('/mark-all-read', auth, async (req, res) => {
    try {
        await markAllAsRead(req.user.id);
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read'
        });
    }
});

module.exports = router;