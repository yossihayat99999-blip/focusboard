import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendMail = async (to, subject, text) => {
    try {
        console.log('Attempting to send email to:', to);
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        });

        console.log('Email sent successfully to:', to);
        return {
            status: 200,
            data: 'Email sent successfully'
        };
    } catch (err) {
        console.error('Email send failed:', err);
        return {
            status: 500,
            data: err.message
        };
    }
};