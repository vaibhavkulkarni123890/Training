const webpush = require('web-push');
const User = require('../models/User');

// Configure web-push with VAPID keys
const VAPID_KEYS = {
    publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HcCWLx6Q67_2e2sZFBjKcfABRX9rlNWNzSHBfMjBkqPwqNdVkbJGGt6DJM',
    privateKey: process.env.VAPID_PRIVATE_KEY || 'VCqfP5YQb3_FWh2Cp4AELEw-4QIDAQAB'
};

webpush.setVapidDetails(
    'mailto:' + (process.env.EMAIL_USER || 'contact@threatviper.com'),
    VAPID_KEYS.publicKey,
    VAPID_KEYS.privateKey
);

// Store push subscription for a user
const subscribeToPush = async (userId, subscription) => {
    try {
        await User.findByIdAndUpdate(userId, {
            pushSubscription: subscription
        });
        console.log(`📱 Push subscription saved for user: ${userId}`);
        return true;
    } catch (error) {
        console.error('❌ Error saving push subscription:', error.message);
        return false;
    }
};

// Send push notification to a user
const sendPushNotification = async (userId, payload) => {
    try {
        const user = await User.findById(userId);
        if (!user || !user.pushSubscription) {
            console.log(`📱 No push subscription found for user: ${userId}`);
            return false;
        }

        const notificationPayload = JSON.stringify({
            title: payload.title,
            body: payload.message,
            icon: '/icon-192x192.png', // Add your app icon
            badge: '/badge-72x72.png', // Add your badge icon
            data: {
                url: payload.actionUrl || '/dashboard',
                notificationId: payload.notificationId || null
            },
            actions: payload.actionText ? [{
                action: 'open',
                title: payload.actionText
            }] : [],
            requireInteraction: payload.priority === 'urgent',
            silent: payload.priority === 'low'
        });

        await webpush.sendNotification(user.pushSubscription, notificationPayload);
        console.log(`📱 Push notification sent to user: ${userId}`);
        return true;
    } catch (error) {
        console.error('❌ Push notification error:', error.message);
        
        // If subscription is invalid, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
            await User.findByIdAndUpdate(userId, {
                $unset: { pushSubscription: 1 }
            });
            console.log(`🗑️ Removed invalid push subscription for user: ${userId}`);
        }
        return false;
    }
};

// Send push notification to multiple users
const sendBulkPushNotifications = async (userIds, payload) => {
    const results = [];
    for (const userId of userIds) {
        const success = await sendPushNotification(userId, payload);
        results.push({ userId, success });
    }
    return results;
};

// Push notification templates
const PushTemplates = {
    projectSelection: (user, project) => ({
        title: '🎯 Project Assigned!',
        message: `Your project "${project.title}" has been assigned. Offer letter ready!`,
        actionUrl: '/dashboard/documents',
        actionText: 'View Documents',
        priority: 'high'
    }),

    offerLetter: (user, project) => ({
        title: '📄 Offer Letter Ready',
        message: `Your offer letter for ${user.planType} Program is ready for download.`,
        actionUrl: '/dashboard/documents',
        actionText: 'Download Now',
        priority: 'high'
    }),

    certificate: (user, project) => ({
        title: '🎉 Congratulations!',
        message: `You completed the ${user.planType} Program! Certificate ready.`,
        actionUrl: '/dashboard/documents',
        actionText: 'Download Certificate',
        priority: 'urgent'
    }),

    weeklyReminder: (user) => ({
        title: '⏰ Weekly Report Due',
        message: 'Don\'t forget to submit your weekly progress report.',
        actionUrl: '/dashboard/reports',
        actionText: 'Submit Report',
        priority: 'medium'
    }),

    paymentSuccess: (user, planType) => ({
        title: '✅ Payment Successful',
        message: `Payment for ${planType} Program processed. Select your project now!`,
        actionUrl: '/dashboard/projects',
        actionText: 'Select Project',
        priority: 'high'
    })
};

// Helper functions for common push notifications
const sendProjectSelectionPush = async (user, project) => {
    const template = PushTemplates.projectSelection(user, project);
    return await sendPushNotification(user._id, template);
};

const sendOfferLetterPush = async (user, project) => {
    const template = PushTemplates.offerLetter(user, project);
    return await sendPushNotification(user._id, template);
};

const sendCertificatePush = async (user, project) => {
    const template = PushTemplates.certificate(user, project);
    return await sendPushNotification(user._id, template);
};

const sendWeeklyReminderPush = async (user) => {
    const template = PushTemplates.weeklyReminder(user);
    return await sendPushNotification(user._id, template);
};

module.exports = {
    subscribeToPush,
    sendPushNotification,
    sendBulkPushNotifications,
    PushTemplates,
    sendProjectSelectionPush,
    sendOfferLetterPush,
    sendCertificatePush,
    sendWeeklyReminderPush,
    VAPID_KEYS
};