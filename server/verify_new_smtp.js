const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const sendTestEmail = async () => {
    console.log('Using SMTP Configuration:');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('User:', process.env.SMTP_USER);
    console.log('Pass:', process.env.SMTP_PASS ? '********' : 'NOT SET');

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const message = {
        from: `Test <${process.env.SMTP_FROM}>`,
        to: 'viralajudia123@gmail.com',
        subject: 'Test Email From Server',
        text: 'This is a test email to verify SMTP credentials.'
    };

    try {
        console.log('Sending email...');
        const info = await transporter.sendMail(message);
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (err) {
        console.error('Email failed:');
        console.error('Code:', err.code);
        console.error('Command:', err.command);
        console.error('Response:', err.response);
        console.error('Full Error:', err);
    }
};

sendTestEmail();
