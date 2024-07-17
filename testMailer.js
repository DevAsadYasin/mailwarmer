const nodemailer = require('nodemailer');

const smtpDetails = {
    host: 'hwsrv-1223902.hostwindsdns.com',    // Replace with your SMTP host
    port: 465,                 // Replace with your SMTP port (use 465 for secure, others for non-secure)
    secure: true,              // Set to true for port 465, false for other ports
    auth: {
        user: 'barbara@chanel-key.com', // Replace with your SMTP user
        pass: 'c#f~uUzp1qF#'  // Replace with your SMTP password
    }
};

const emailDetails = {
    from: 'barbara@chanel-key.com',     // Replace with the sender's email address
    to: 'dev.asad.yasin@gmail.com',    // Replace with the recipient's email address
    subject: 'Test Email',          // Replace with the email subject
    text: 'This is a test email.'   // Replace with the email text
};

// Create a Nodemailer transporter using the provided SMTP details
const transporter = nodemailer.createTransport({
    host: smtpDetails.host,
    port: smtpDetails.port,
    secure: smtpDetails.secure,
    auth: smtpDetails.auth,
    authMethod: 'PLAIN'
});

// Define the email options
const mailOptions = {
    from: emailDetails.from,
    to: emailDetails.to,
    subject: emailDetails.subject,
    text: emailDetails.text
};

// Send the email
transporter.sendMail(mailOptions)
    .then(info => {
        console.log('Email sent:', info.response);
    })
    .catch(error => {
        console.error('Error:', error);
    });
