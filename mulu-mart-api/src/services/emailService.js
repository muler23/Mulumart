const nodemailer = require('nodemailer');
const ErrorResponse = require('../utils/errorResponse');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `Mulu-Mart <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email service error:', error);
      throw new ErrorResponse('Email could not be sent', 500);
    }
  }

  async sendWelcomeEmail(user) {
    const subject = 'Welcome to Mulu-Mart!';
    const html = this.getWelcomeTemplate(user);
    
    await this.sendEmail({
      email: user.email,
      subject,
      html
    });
  }

  async sendEmailVerification(user, token) {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    const subject = 'Verify your email address';
    const html = this.getEmailVerificationTemplate(user, verificationUrl);
    
    await this.sendEmail({
      email: user.email,
      subject,
      html
    });
  }

  async sendPasswordReset(user, token) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const subject = 'Password Reset Request';
    const html = this.getPasswordResetTemplate(user, resetUrl);
    
    await this.sendEmail({
      email: user.email,
      subject,
      html
    });
  }

  async sendAdApproved(user, ad) {
    const subject = 'Your ad has been approved!';
    const html = this.getAdApprovedTemplate(user, ad);
    
    await this.sendEmail({
      email: user.email,
      subject,
      html
    });
  }

  async sendAdRejected(user, ad, reason) {
    const subject = 'Your ad has been rejected';
    const html = this.getAdRejectedTemplate(user, ad, reason);
    
    await this.sendEmail({
      email: user.email,
      subject,
      html
    });
  }

  getWelcomeTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Mulu-Mart</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Mulu-Mart!</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>Thank you for joining Mulu-Mart! Your account has been successfully created.</p>
            <p>You can now start posting ads and connecting with buyers and sellers in your area.</p>
            <p>
              <a href="${process.env.CLIENT_URL}" class="button">Get Started</a>
            </p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br>The Mulu-Mart Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getEmailVerificationTemplate(user, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #2196F3; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email Address</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>Please click the button below to verify your email address and activate your Mulu-Mart account.</p>
            <p>
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>Best regards,<br>The Mulu-Mart Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTemplate(user, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #FF9800; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>We received a request to reset your password. Click the button below to set a new password.</p>
            <p>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>This link will expire in 10 minutes.</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p>Best regards,<br>The Mulu-Mart Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAdApprovedTemplate(user, ad) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Ad Has Been Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Ad Has Been Approved!</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>Great news! Your ad "<strong>${ad.title}</strong>" has been approved and is now live on Mulu-Mart.</p>
            <p>
              <a href="${process.env.CLIENT_URL}/ads/${ad._id}" class="button">View Your Ad</a>
            </p>
            <p>You can manage your ads from your dashboard.</p>
            <p>Best regards,<br>The Mulu-Mart Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAdRejectedTemplate(user, ad, reason) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Ad Has Been Rejected</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f44336; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #f44336; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Ad Has Been Rejected</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>Your ad "<strong>${ad.title}</strong>" has been rejected for the following reason:</p>
            <p><em>${reason || 'Violation of our terms of service'}</em></p>
            <p>Please review our guidelines and make the necessary changes before resubmitting.</p>
            <p>
              <a href="${process.env.CLIENT_URL}/dashboard" class="button">Review Guidelines</a>
            </p>
            <p>If you believe this was a mistake, please contact our support team.</p>
            <p>Best regards,<br>The Mulu-Mart Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
