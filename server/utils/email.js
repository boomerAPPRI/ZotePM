const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT, // 587 or 2525 or 465
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false // Helps with self-signed certs in dev
        }
    });

    // 2. Define email options
    const mailOptions = {
        from: `ZotePM Support <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    // 3. Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
