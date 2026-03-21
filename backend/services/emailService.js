const cron = require('node-cron');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const {
    sendProjectSelectionNotification,
    sendOfferLetterNotification,
    sendCertificateNotification,
    sendWeeklyReminderNotification,
    cleanupOldNotifications
} = require('./notificationService');
const {
    sendProjectSelectionPush,
    sendOfferLetterPush,
    sendCertificatePush,
    sendWeeklyReminderPush
} = require('./pushNotificationService');

// Check if SMTP is disabled (for hosting environments that block SMTP)
const SMTP_DISABLED = process.env.DISABLE_SMTP === 'true';
const EMAIL_ENABLED = process.env.ENABLE_EMAIL === 'true'; // Only send emails if explicitly enabled

// EmailJS configuration (HTTP-based email service)
const EMAILJS_CONFIG = {
    serviceId: process.env.EMAILJS_SERVICE_ID || 'service_default',
    templateId: process.env.EMAILJS_TEMPLATE_ID || 'template_default',
    publicKey: process.env.EMAILJS_PUBLIC_KEY || '',
    privateKey: process.env.EMAILJS_PRIVATE_KEY || ''
};

// Send email via EmailJS (HTTP API - bypasses SMTP blocking)
const sendEmailViaHTTP = async (to, subject, html, attachments = []) => {
    try {
        if (!EMAILJS_CONFIG.publicKey) {
            return false;
        }

        const emailData = {
            service_id: EMAILJS_CONFIG.serviceId,
            template_id: EMAILJS_CONFIG.templateId,
            user_id: EMAILJS_CONFIG.publicKey,
            accessToken: EMAILJS_CONFIG.privateKey,
            template_params: {
                to_email: to,
                subject: subject,
                message: html,
                from_name: 'TVP IT Solutions',
                from_email: process.env.EMAIL_USER || 'contact@threatviper.com'
            }
        };

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData)
        });

        if (response.ok) {
            console.log(`✅ Email sent successfully via EmailJS to: ${to}`);
            return true;
        } else {
            console.log(`❌ EmailJS failed: ${response.status} ${response.statusText}`);
            return false;
        }
    } catch (error) {
        console.error('EmailJS error:', error.message);
        return false;
    }
};

// Alternative: Send email via Formspree (another HTTP email service)
const sendEmailViaFormspree = async (to, subject, html) => {
    try {
        if (!process.env.FORMSPREE_ENDPOINT) {
            return false;
        }

        const response = await fetch(process.env.FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: to,
                subject: subject,
                message: html,
                _replyto: process.env.EMAIL_USER
            })
        });

        if (response.ok) {
            console.log(`✅ Email sent successfully via Formspree to: ${to}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Formspree email error:', error.message);
        return false;
    }
};

// SMTP Transporters (fallback only)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 465,
    secure: true,
    family: 4,
    connectionTimeout: 5000,
    greetingTimeout: 3000,
    socketTimeout: 5000,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

const fallbackTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false,
    family: 4,
    connectionTimeout: 5000,
    greetingTimeout: 3000,
    socketTimeout: 5000,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Main email sending function
const sendEmail = async (to, subject, html, attachments = []) => {
    try {
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
            console.log(`[EMAIL PLACEHOLDER] To: ${to}, Subject: ${subject}`);
            return;
        }

        console.log(`📧 Sending email to: ${to}`);
        console.log(`📧 Subject: ${subject}`);

        // Try HTTP-based email services first (these bypass SMTP blocking)
        console.log('🌐 Trying HTTP email services...');

        // Try EmailJS first
        const emailjsSuccess = await sendEmailViaHTTP(to, subject, html, attachments);
        if (emailjsSuccess) {
            return;
        }

        // Try Formspree as backup
        const formspreeSuccess = await sendEmailViaFormspree(to, subject, html);
        if (formspreeSuccess) {
            return;
        }

        // If HTTP services failed and SMTP is disabled, log the email
        if (SMTP_DISABLED) {
            console.log(`⚠️ HTTP email services not configured and SMTP disabled`);
            console.log(`📝 Email logged for manual follow-up:`);
            console.log(`   To: ${to}`);
            console.log(`   Subject: ${subject}`);
            console.log(`   Content: ${html.substring(0, 200)}...`);
            return;
        }

        // Last resort: Try SMTP (will likely fail on Render)
        console.log('📡 Trying SMTP as last resort...');

        const mailOptions = {
            from: `"TVP IT Solutions" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            attachments
        };

        // Try SMTP transporters quickly
        const transporters = [
            { name: 'Primary (465)', transporter: transporter },
            { name: 'Fallback (587)', transporter: fallbackTransporter }
        ];

        for (const { name, transporter: currentTransporter } of transporters) {
            try {
                await currentTransporter.verify();
                await currentTransporter.sendMail(mailOptions);
                console.log(`✅ Email sent via SMTP ${name} to: ${to}`);
                return;
            } catch (error) {
                console.log(`❌ SMTP ${name} failed: ${error.message}`);
                continue;
            }
        }

        // All methods failed
        console.error(`🚨 CRITICAL: All email methods failed for: ${to}`);
        console.log(`📧 Subject: ${subject}`);
        console.log(`⚠️ This email needs manual follow-up!`);
        console.log(`💡 Consider setting up EmailJS or Formspree for reliable email delivery`);

    } catch (err) {
        console.error('❌ Email send error:', err.message);
        console.log(`📝 Failed email logged: "${subject}" to ${to}`);
    }
};

// ─── Project Selection Email ───────────────────────────────────────
const sendProjectSelectionEmail = async (user, project) => {
    // Always send in-app notification
    await sendProjectSelectionNotification(user, project);

    // Only send email if enabled
    if (!EMAIL_ENABLED) {
        console.log('📱 In-app notification sent instead of email for project selection');
        return;
    }

    const subject = `Project Assigned: ${project.title} — TVP IT Solutions`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Project Selection Confirmed! 🎯</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>You have successfully selected your project for the <strong>${user.planType} Program</strong>.</p>
            <div style="background: #f0f7ff; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 10px 0; color: #1e293b;">${project.title}</h3>
                <p style="margin: 0; color: #64748b;">${project.description}</p>
                <p style="margin: 10px 0 0 0;"><strong>Tech Stack:</strong> ${project.techStack.join(', ')}</p>
                <p style="margin: 5px 0 0 0;"><strong>Duration:</strong> ${project.estimatedWeeks} weeks</p>
            </div>
            <p><strong>Important:</strong> This selection is final and cannot be changed.</p>
            <p>Your offer letter has been generated and is available for download in your dashboard.</p>
            <p>Weekly report submissions begin from next week. Make sure to submit on time!</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #94a3b8; font-size: 12px;">TVP IT Solutions — Part of Threat Viper Security</p>
        </div>
    `;
    const attachments = [];
    if (user.offerLetterUrl) {
        const filePath = require('path').join(__dirname, '..', user.offerLetterUrl);
        if (require('fs').existsSync(filePath)) {
            attachments.push({
                filename: `Offer_Letter_${user.name.replace(/\s+/g, '_')}.html`,
                path: filePath
            });
        }
    }
    await sendEmail(user.email, subject, html, attachments);
};

// ─── Offer Letter Email ────────────────────────────────────────────
const sendOfferLetterEmail = async (user, project) => {
    // Always send in-app notification
    await sendOfferLetterNotification(user, project);

    // Only send email if enabled
    if (!EMAIL_ENABLED) {
        console.log('📱 In-app notification sent instead of email for offer letter');
        return;
    }

    const subject = `Your Offer Letter — TVP IT Solutions`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Your Offer Letter is Ready! 📄</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your offer letter for the <strong>${user.planType} Program</strong> has been generated.</p>
            <p>Project: <strong>${project.title}</strong></p>
            <p>You can download it from your dashboard.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #94a3b8; font-size: 12px;">TVP IT Solutions — Part of Threat Viper Security</p>
        </div>
    `;
    await sendEmail(user.email, subject, html);
};

// ─── Certificate Email ─────────────────────────────────────────────
const sendCertificateEmail = async (user, project) => {
    // Always send in-app notification
    await sendCertificateNotification(user, project);

    // Only send email if enabled
    if (!EMAIL_ENABLED) {
        console.log('📱 In-app notification sent instead of email for certificate');
        return;
    }

    const subject = `Congratulations! Certificate of Completion — TVP IT Solutions`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #22c55e;">Congratulations! 🎉</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>You have successfully completed the <strong>${user.planType} Program</strong> at TVP IT Solutions!</p>
            <div style="background: #f0fdf4; padding: 20px; border-left: 4px solid #22c55e; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0;"><strong>Project:</strong> ${project.title}</p>
                <p style="margin: 5px 0 0 0;"><strong>Category:</strong> ${project.category}</p>
            </div>
            <p>Your Certificate of Completion is ready for download in your dashboard.</p>
            ${user.planType === 'Advanced' ? '<p>Your Performance Report has also been generated.</p>' : ''}
            <p>We wish you the best in your career!</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #94a3b8; font-size: 12px;">TVP IT Solutions — Part of Threat Viper Security</p>
        </div>
    `;
    await sendEmail(user.email, subject, html);
};

// ─── Weekly Deadline Reminder (Cron: Sunday 6PM) ───────────────────
const startEmailReminders = () => {
    cron.schedule('0 18 * * 0', async () => {
        try {
            const users = await User.find({
                role: 'user',
                paymentStatus: 'paid',
                selectedProject: { $ne: null },
                courseCompleted: false
            });

            console.log(`📧 Processing weekly reminders for ${users.length} users...`);

            for (const user of users) {
                const lastSubmission = await User.findById(user._id).populate({
                    path: 'weeklySubmissions',
                    options: { sort: { 'createdAt': -1 }, limit: 1 }
                });

                const now = new Date();
                const diff = lastSubmission.weeklySubmissions.length > 0
                    ? now - lastSubmission.weeklySubmissions[0].createdAt
                    : Infinity;

                // If no submission in the last 6 days, send reminder
                if (diff > 6 * 24 * 60 * 60 * 1000) {
                    // Always send in-app notification (unlimited)
                    await sendWeeklyReminderNotification(user);

                    // Send push notification to device (unlimited)
                    if (user.notificationPreferences?.push !== false) {
                        await sendWeeklyReminderPush(user);
                    }

                    // Only send email if enabled (limited by email service)
                    if (EMAIL_ENABLED && user.notificationPreferences?.email !== false) {
                        const subject = '⏰ Weekly Report Deadline Reminder — TVP IT Solutions';
                        const html = `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                <h2 style="color: #f59e0b;">Weekly Report Reminder ⏰</h2>
                                <p>Hi <strong>${user.name}</strong>,</p>
                                <p>This is a reminder to submit your weekly progress report for the TVP IT Solutions training program.</p>
                                <div style="background: #fffbeb; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px;">
                                    <p style="margin: 0;"><strong>Deadline:</strong> End of this week</p>
                                    <p style="margin: 5px 0 0 0;">Consistent submissions are required for certificate eligibility.</p>
                                </div>
                                <p>Log in to your dashboard to submit your report.</p>
                                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                                <p style="color: #94a3b8; font-size: 12px;">TVP IT Solutions — Part of Threat Viper Security</p>
                            </div>
                        `;
                        await sendEmail(user.email, subject, html);
                    }
                }
            }

            console.log('📧 Weekly reminders processing completed');

            // Cleanup old notifications weekly
            await cleanupOldNotifications(30);

        } catch (err) {
            console.error('❌ Cron error:', err);
        }
    });
};

module.exports = {
    startEmailReminders,
    sendProjectSelectionEmail,
    sendOfferLetterEmail,
    sendCertificateEmail,
    sendEmail
};