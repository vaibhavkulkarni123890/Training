const fs = require('fs');
const path = require('path');

// Ensure documents directory exists
const docsDir = path.join(__dirname, '..', 'documents');
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

/**
 * Generate an offer letter HTML file for a user who selected a project
 * Returns the relative URL path to the generated file
 */
const generateOfferLetter = async (user, project) => {
    const date = new Date().toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const refNumber = `TVP-OL-${Date.now().toString(36).toUpperCase()}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Offer Letter - ${user.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; background: white; color: #1a1a1a; padding: 60px; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 40px; }
        .header h1 { color: #2563eb; font-size: 28px; letter-spacing: 2px; }
        .header p { color: #666; font-size: 12px; margin-top: 8px; }
        .ref { text-align: right; font-size: 13px; color: #888; margin-bottom: 30px; }
        .date { margin-bottom: 30px; font-size: 14px; }
        .content { line-height: 1.8; font-size: 15px; }
        .content p { margin-bottom: 15px; }
        .highlight { background: #f0f7ff; padding: 20px; border-left: 4px solid #2563eb; margin: 25px 0; border-radius: 0 8px 8px 0; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .details-table td { padding: 10px 15px; border: 1px solid #e0e0e0; font-size: 14px; }
        .details-table td:first-child { font-weight: bold; background: #f8f9fa; width: 200px; }
        .footer { margin-top: 60px; border-top: 1px solid #ddd; padding-top: 20px; }
        .signature { margin-top: 40px; }
        .signature-text { font-family: 'Great Vibes', cursive; font-size: 32px; color: #1e3a8a; margin-bottom: 5px; }
        .signature .name { font-weight: bold; font-size: 16px; }
        .stamp { color: #2563eb; font-weight: bold; font-size: 14px; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>TVP IT SOLUTIONS</h1>
        <p>Part of Threat Viper Security | Project-Based Training Programs</p>
    </div>
    
    <div class="ref">Ref: ${refNumber}</div>
    <div class="date">Date: ${date}</div>

    <div class="content">
        <p>Dear <strong>${user.name}</strong>,</p>

        <p>We are pleased to inform you that you have been accepted into the <strong>${user.planType} Program</strong> at TVP IT Solutions. This letter serves as your official offer of enrollment and project assignment.</p>

        <div class="highlight">
            <p><strong>Project Assignment:</strong> ${project.title}</p>
            <p style="font-size: 14px; color: #555; margin-bottom: 0;">${project.description}</p>
        </div>

        <table class="details-table">
            <tr><td>Candidate Name</td><td>${user.name}</td></tr>
            <tr><td>Email</td><td>${user.email}</td></tr>
            <tr><td>Program</td><td>${user.planType} Program</td></tr>
            <tr><td>Project</td><td>${project.title}</td></tr>
            <tr><td>Category</td><td>${project.category}</td></tr>
            <tr><td>Difficulty Level</td><td>${project.difficulty}</td></tr>
            <tr><td>Tech Stack</td><td>${project.techStack.join(', ')}</td></tr>
            <tr><td>Estimated Duration</td><td>${project.estimatedWeeks} Weeks</td></tr>
            <tr><td>Start Date</td><td>${date}</td></tr>
        </table>

        <p><strong>Terms and Conditions:</strong></p>
        <p>1. You are required to submit weekly progress reports by the specified deadlines.</p>
        <p>2. All submissions will be checked for plagiarism using our automated detection system.</p>
        <p>3. A minimum performance score of 60% is required across all weekly evaluations.</p>
        <p>4. Upon successful completion, you will receive a Certificate of Completion${user.planType === 'Advanced' ? ' along with a detailed Performance Report' : ''}.</p>
        <p>5. Project selection is final and cannot be changed once confirmed.</p>

        <p>We look forward to seeing your growth and the successful completion of your project. Welcome aboard!</p>

        <div class="signature">
            <p>Best Regards,</p>
            <br>
            <div class="signature-text">Vaibhav</div>
            <div class="name">Vaibhav</div>
            <div class="stamp">Founder & CEO, TVP IT Solutions</div>
            <p style="font-size: 12px; color: #888; margin-top: 10px;">contact@threatviper.com</p>
        </div>
    </div>

    <div class="footer">
        <p style="font-size: 11px; color: #999; text-align: center;">This is a system-generated document. For any queries, please contact contact@threatviper.com</p>
    </div>
</body>
</html>`;

    const filename = `offer-letter-${user._id}-${Date.now()}.html`;
    const filepath = path.join(docsDir, filename);
    fs.writeFileSync(filepath, html, 'utf-8');

    return `/documents/${filename}`;
};

/**
 * Generate a certificate HTML file for a user who completed their course
 * Returns the relative URL path to the generated file
 */
const generateCertificate = async (user, project) => {
    const date = new Date().toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const certNumber = `TVP-CERT-${Date.now().toString(36).toUpperCase()}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Certificate - ${user.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', serif; background: white; }
        .certificate { max-width: 900px; margin: 40px auto; border: 3px solid #2563eb; padding: 60px; position: relative; }
        .certificate::before { content: ''; position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px; border: 1px solid #93c5fd; pointer-events: none; }
        .header { text-align: center; margin-bottom: 40px; }
        .header .org { color: #2563eb; font-size: 32px; font-weight: bold; letter-spacing: 3px; }
        .header .subtitle { color: #666; font-size: 14px; margin-top: 8px; letter-spacing: 1px; }
        .title { text-align: center; margin-bottom: 40px; }
        .title h2 { font-size: 20px; color: #888; text-transform: uppercase; letter-spacing: 5px; margin-bottom: 10px; }
        .title h1 { font-size: 36px; color: #1a1a1a; border-bottom: 2px solid #2563eb; display: inline-block; padding-bottom: 10px; }
        .body { text-align: center; line-height: 2; font-size: 16px; margin-bottom: 40px; }
        .name { font-size: 28px; font-weight: bold; color: #2563eb; margin: 10px 0; }
        .project { font-style: italic; color: #444; }
        .details { display: flex; justify-content: space-around; margin: 40px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .detail-item { text-align: center; }
        .detail-item .label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
        .detail-item .value { font-size: 16px; font-weight: bold; margin-top: 5px; }
        .footer { display: flex; justify-content: space-between; align-items: end; margin-top: 50px; }
        .sign { text-align: center; }
        .sign-text { font-family: 'Great Vibes', cursive; font-size: 36px; color: #1e3a8a; margin-bottom: -5px; }
        .sign .line { width: 220px; border-top: 1px solid #333; margin-bottom: 8px; }
        .sign .role { font-size: 13px; color: #666; }
        .cert-no { text-align: center; font-size: 11px; color: #aaa; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="header">
            <div class="org">TVP IT SOLUTIONS</div>
            <div class="subtitle">Part of Threat Viper Security</div>
        </div>

        <div class="title">
            <h2>Certificate</h2>
            <h1>of Completion</h1>
        </div>

        <div class="body">
            <p>This is to certify that</p>
            <div class="name">${user.name}</div>
            <p>has successfully completed the <strong>${user.planType} Program</strong></p>
            <p>with the project</p>
            <div class="project">"${project.title}"</div>
        </div>

        <div class="details">
            <div class="detail-item">
                <div class="label">Category</div>
                <div class="value">${project.category}</div>
            </div>
            <div class="detail-item">
                <div class="label">Difficulty</div>
                <div class="value">${project.difficulty}</div>
            </div>
            <div class="detail-item">
                <div class="label">Duration</div>
                <div class="value">${project.estimatedWeeks} Weeks</div>
            </div>
            <div class="detail-item">
                <div class="label">Date</div>
                <div class="value">${date}</div>
            </div>
        </div>

        <div class="footer">
            <div class="sign">
                <div class="sign-text">Vaibhav</div>
                <div class="line"></div>
                <strong>Vaibhav</strong>
                <div class="role">Founder & CEO</div>
            </div>
            <div class="sign">
                <div class="line" style="margin-top: 40px;"></div>
                <strong>${user.name}</strong>
                <div class="role">Participant</div>
            </div>
        </div>

        <div class="cert-no">Certificate No: ${certNumber}</div>
    </div>
</body>
</html>`;

    const filename = `certificate-${user._id}-${Date.now()}.html`;
    const filepath = path.join(docsDir, filename);
    fs.writeFileSync(filepath, html, 'utf-8');

    return `/documents/${filename}`;
};

module.exports = { generateOfferLetter, generateCertificate };
