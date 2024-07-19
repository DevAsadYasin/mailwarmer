const nodemailer = require('nodemailer');

const smtpDetails = {
    smtp: {
        host: "hwsrv-1223902.hostwindsdns.com",
        port: 465,
        secure: true,
        auth: {
            user: "charles@forummarketingsolution.com",
            pass: ",HyBF@nb9Y!0"
        }
    }
};

const emailDetails = {
    from: 'charles@forummarketingsolution.com',
    to: 'dev.asad.yasin@gmail.com',
    subject: 'Test Email',
    text: 'This is a test email.'
};

const transporter = nodemailer.createTransport({
    host: smtpDetails.smtp.host,
    port: smtpDetails.smtp.port,
    secure: smtpDetails.smtp.secure,
    auth: smtpDetails.smtp.auth
});

const mailOptions = {
    from: emailDetails.from,
    to: emailDetails.to,
    subject: emailDetails.subject,
    text: emailDetails.text
};

transporter.sendMail(mailOptions)
    .then(info => {
        console.log('Email sent:', info.response);
    })
    .catch(error => {
        console.error('Error:', error);
    });
