// utils/sendEmail.js
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const sendEmail = async options => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST, // smtp.gmail.com
    port: process.env.MAIL_PORT, // 587
    secure: false, // use TLS
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message
    // html: options.html // optional for HTML emails
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
