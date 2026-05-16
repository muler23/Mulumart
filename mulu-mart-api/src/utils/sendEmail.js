// utils/sendEmail.js
const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
const ErrorResponse = require('./errorResponse');

// Create a transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Send email
exports.sendEmail = async (options) => {
  try {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/email/${options.template}.pug`,
      {
        name: options.user.name,
        url: options.url,
        subject: options.subject
      }
    );

    // 2) Define email options
    const mailOptions = {
      from: `Mulu-Mart <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      html,
      text: htmlToText(html)
    };

    // 3) Create a transport and send email
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending email:', err);
    throw new Error('There was an error sending the email. Try again later.');
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (user, resetUrl) => {
  try {
    const html = pug.renderFile(`${__dirname}/../views/email/passwordReset.pug`, {
      name: user.name,
      resetUrl,
      subject: 'Your password reset token (valid for 10 minutes)'
    });

    const mailOptions = {
      from: `Mulu-Mart <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      html,
      text: htmlToText(html)
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending password reset email:', err);
    throw new Error('There was an error sending the password reset email.');
  }
};

// Send welcome email
exports.sendWelcomeEmail = async (user) => {
  try {
    const html = pug.renderFile(`${__dirname}/../views/email/welcome.pug`, {
      name: user.name,
      subject: 'Welcome to Mulu-Mart!'
    });

    const mailOptions = {
      from: `Mulu-Mart <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Welcome to Mulu-Mart!',
      html,
      text: htmlToText(html)
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending welcome email:', err);
    // Don't throw error for welcome email
  }
};