const Notification = require('../models/Notification');
const User = require('../models/User');

// Create a new notification
const createNotification = async (userId, type, title, message, options = {}) => {
    try {
        const notification = new Notification({
            userId,
            type,
            title,
            message,
            priority: options.priority || 'medium',
            actionUrl: options.actionUrl || null,
            actionText: options.actionText || null,
            expiresAt: options.expiresAt || null
        });

        await notification.save();
        console.log(`📢 Notification created for user ${userId}: ${title}`);
        return notification;
    } catch (error) {
        console.error('❌ Error creating notification:', error.message);
        return null;
    }
};

// Get notifications for a user
const getUserNotifications = async (userId, limit = 20, unreadOnly = false) => {
    try {
        const query = { userId };
        if (unreadOnly) {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit);

        return notifications;
    } catch (error) {
        console.error('❌ Error fetching notifications:', error.message);
        return [];
    }
};

// Mark notification as read
const markAsRead = async (notificationId, userId) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { isRead: true }
        );
        return true;
    } catch (error) {
        console.error('❌ Error marking notification as read:', error.message);
        return false;
    }
};

// Mark all notifications as read for a user
const markAllAsRead = async (userId) => {
    try {
        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
        return true;
    } catch (error) {
        console.error('❌ Error marking all notifications as read:', error.message);
        return false;
    }
};

// Get unread count for a user
const getUnreadCount = async (userId) => {
    try {
        const count = await Notification.countDocuments({ userId, isRead: false });
        return count;
    } catch (error) {
        console.error('❌ Error getting unread count:', error.message);
        return 0;
    }
};

// Delete old notifications (cleanup)
const cleanupOldNotifications = async (daysOld = 30) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await Notification.deleteMany({
            createdAt: { $lt: cutoffDate },
            isRead: true
        });

        console.log(`🧹 Cleaned up ${result.deletedCount} old notifications`);
        return result.deletedCount;
    } catch (error) {
        console.error('❌ Error cleaning up notifications:', error.message);
        return 0;
    }
};

// Notification templates
const NotificationTemplates = {
    projectSelection: (user, project) => ({
        type: 'project_selection',
        title: '🎯 Project Assigned!',
        message: `Your project "${project.title}" has been assigned for the ${user.planType} Program. Your offer letter is ready for download.`,
        priority: 'high',
        actionUrl: '/dashboard/documents',
        actionText: 'Download Offer Letter'
    }),

    offerLetter: (user, project) => ({
        type: 'offer_letter',
        title: '📄 Offer Letter Ready',
        message: `Your offer letter for the ${user.planType} Program is ready for download.`,
        priority: 'high',
        actionUrl: '/dashboard/documents',
        actionText: 'Download Now'
    }),

    certificate: (user, project) => ({
        type: 'certificate',
        title: '🎉 Congratulations!',
        message: `You have successfully completed the ${user.planType} Program! Your certificate is ready for download.`,
        priority: 'urgent',
        actionUrl: '/dashboard/documents',
        actionText: 'Download Certificate'
    }),

    weeklyReminder: (user) => ({
        type: 'weekly_reminder',
        title: '⏰ Weekly Report Due',
        message: 'Don\'t forget to submit your weekly progress report. Consistent submissions are required for certificate eligibility.',
        priority: 'medium',
        actionUrl: '/dashboard/reports',
        actionText: 'Submit Report',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
    }),

    paymentSuccess: (user, planType) => ({
        type: 'general',
        title: '✅ Payment Successful',
        message: `Your payment for the ${planType} Program has been processed successfully. You can now select your project.`,
        priority: 'high',
        actionUrl: '/dashboard/projects',
        actionText: 'Select Project'
    }),

    courseCompletion: (user) => ({
        type: 'general',
        title: '🎓 Course Completed',
        message: 'Congratulations on completing your training program! All your documents are available in the dashboard.',
        priority: 'high',
        actionUrl: '/dashboard/documents',
        actionText: 'View Documents'
    })
};

// Helper functions for common notifications
const sendProjectSelectionNotification = async (user, project) => {
    const template = NotificationTemplates.projectSelection(user, project);
    return await createNotification(user._id, template.type, template.title, template.message, template);
};

const sendOfferLetterNotification = async (user, project) => {
    const template = NotificationTemplates.offerLetter(user, project);
    return await createNotification(user._id, template.type, template.title, template.message, template);
};

const sendCertificateNotification = async (user, project) => {
    const template = NotificationTemplates.certificate(user, project);
    return await createNotification(user._id, template.type, template.title, template.message, template);
};

const sendWeeklyReminderNotification = async (user) => {
    const template = NotificationTemplates.weeklyReminder(user);
    return await createNotification(user._id, template.type, template.title, template.message, template);
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    cleanupOldNotifications,
    NotificationTemplates,
    sendProjectSelectionNotification,
    sendOfferLetterNotification,
    sendCertificateNotification,
    sendWeeklyReminderNotification
};