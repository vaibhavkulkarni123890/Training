const cron = require('node-cron');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 465,
    secure: true, // true for 465, false for 587
    family: 4, // Force IPv4
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000, // 5 seconds
    socketTimeout: 10000, // 10 seconds
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Accept self-signed certificates
    }
});

// Fallback transporter for port 587 with STARTTLS
const fallbackTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false, // false for 587
    family: 4, // Force IPv4
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Gmail fallback (in case Hostinger is blocked)
const gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || process.env.EMAIL_USER,
        pass: process.env.GMAIL_PASS || process.env.EMAIL_PASS
    }
});

// Alternative port 2525 (often unblocked on hosting providers)
const alternativeTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 2525,
    secure: false,
    family: 4,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Helper: send email (swallows errors if email config is placeholder)
const sendEmail = async (to, subject, html, attachments = []) => {
    try {
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
            console.log(`[EMAIL PLACEHOLDER] To: ${to}, Subject: ${subject}`);
            return;
        }

        const mailOptions = {
            from: `"TVP IT Solutions" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            attachments
        };

        // Try multiple transporters in order
        const transporters = [
            { name: 'Primary (465)', transporter: transporter },
            { name: 'Fallback (587)', transporter: fallbackTransporter },
            { name: 'Alternative (2525)', transporter: alternativeTransporter }
        ];

        // Add Gmail as fallback if we have Gmail credentials
        if (process.env.GMAIL_USER || process.env.EMAIL_USER.includes('gmail.com')) {
            transporters.push({ name: 'Gmail', transporter: gmailTransporter });
        }

        let lastError;

        for (const { name, transporter: currentTransporter } of transporters) {
            try {
                console.log(`Trying ${name} transporter...`);
                await currentTransporter.verify();
                await currentTransporter.sendMail(mailOptions);
                console.log(`Email sent successfully to: ${to} (via ${name})`);
                return; // Success, exit function
            } catch (error) {
                console.log(`${name} transporter failed: ${error.message}`);
                lastError = error;
                continue; // Try next transporter
            }
        }

        // If we get here, all transporters failed
        throw lastError;

    } catch (err) {
        console.error('Email send error (all transporters failed):', err.message);
        console.error('Full error details:', {
            code: err.code,
            command: err.command,
            response: err.response,
            responseCode: err.responseCode
        });

        // Log suggestion for debugging
        if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
            console.log('SUGGESTION: Your hosting provider may be blocking SMTP ports. Consider using a service like SendGrid, Mailgun, or enabling Gmail App Passwords.');
        }

        // Don't throw the error to prevent breaking the application
        // Just log it for debugging
    }
};

// ─── Project Selection Email ───────────────────────────────────────
const sendProjectSelectionEmail = async (user, project) => {
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
            console.log('Weekly reminders sent');
        } catch (err) {
            console.error('Cron error:', err);
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
