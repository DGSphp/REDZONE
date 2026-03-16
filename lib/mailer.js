import nodemailer from 'nodemailer';

// lib/mailer.js

export async function sendNotification(to, subject, html) {
    // For development/demo, we'll just log if no env vars are set
    // In a real app, you'd use process.env.SMTP_HOST, etc.

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log("--- MOCK EMAIL SEND ---");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${html}`);
        console.log("-----------------------");
        return { mock: true };
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const info = await transporter.sendMail({
        from: process.env.SMTP_USER || '"Partnership Harmony" <no-reply@harmony.app>',
        to,
        subject,
        html,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
}
