const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Sender = require('./models/Sender'); // Adjust the path as per your project structure

// MongoDB connection URI with authentication
const mongoURI = 'mongodb://Asad:Asad@localhost:27017/emailWarmup'; // Replace with your MongoDB URI

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: "admin"
})
.then(() => {
    console.log('Connected to MongoDB');

    // Fetch sender data from MongoDB
    return Sender.findOne({ email: 'jose@sdemails.com' }); // Adjust the query as per your schema
})
.then(sender => {
    if (!sender) {
        throw new Error('Sender not found in database');
    }

    console.log('Sender retrieved from database:', sender);

    // Create a Nodemailer transporter using sender's SMTP details
    const transporter = nodemailer.createTransport({
        host: sender.smtp.host,
        port: sender.smtp.port,
        secure: true,  // true for 465, false for other ports
        auth: {
            user: sender.smtp.auth.user,
            pass: sender.smtp.auth.pass
        },
        authMethod: 'PLAIN'
    });

    // Define the email options
    const mailOptions = {
        from: sender.email,
        to: 'asad.yasin@devsinc.com',  // Replace with the recipient's email
        subject: 'Test Email',
        text: 'This is a test email from the email warm-up application.'
    };

    // Send the email
    return transporter.sendMail(mailOptions);
})
.then(info => {
    console.log('Email sent:', info.response);
})
.catch(error => {
    console.error('Error:', error);
})
.finally(() => {
    // Disconnect from MongoDB
    mongoose.disconnect();
});
