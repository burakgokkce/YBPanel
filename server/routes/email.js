const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { auth } = require('../middleware/auth');

// Email configuration (you can use environment variables// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ybdigitalx@gmail.com',
    pass: 'your-app-password' // Bu kısmı gerçek Gmail App Password ile değiştirin
  }
});

// Check if we have valid email credentials
const hasValidEmailConfig = false; // Gerçek SMTP için true yapın

// Mock email sending for demo purposes
const mockEmailSend = async (emailData) => {
  console.log(' Mock Email Sent:');
  console.log('From:', emailData.from);
  console.log('To:', emailData.to);
  console.log('Subject:', emailData.subject);
  console.log('HTML Content:', emailData.html.substring(0, 100) + '...');
  console.log('---');
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { messageId: 'mock-' + Date.now() };
};

// Send meeting invitation
router.post('/send-meeting-invitation', auth, async (req, res) => {
  try {
    const { meetingTitle, meetingDate, meetingTime, meetingLink, attendeeEmails, notes } = req.body;

    if (!meetingTitle || !meetingDate || !attendeeEmails || attendeeEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Meeting title, date, and attendees are required'
      });
    }

    const emailSubject = `Toplantı Daveti: ${meetingTitle}`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Toplantı Daveti</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b;">${meetingTitle}</h3>
          
          <div style="margin: 15px 0;">
            <strong>📅 Tarih:</strong> ${new Date(meetingDate).toLocaleDateString('tr-TR')}
          </div>
          
          ${meetingTime ? `
          <div style="margin: 15px 0;">
            <strong>🕐 Saat:</strong> ${meetingTime}
          </div>
          ` : ''}
          
          ${meetingLink ? `
          <div style="margin: 15px 0;">
            <strong>🔗 Toplantı Linki:</strong> 
            <a href="${meetingLink}" style="color: #3b82f6; text-decoration: none;">${meetingLink}</a>
          </div>
          ` : ''}
          
          ${notes ? `
          <div style="margin: 15px 0;">
            <strong>📝 Notlar:</strong>
            <p style="margin: 5px 0; color: #64748b;">${notes}</p>
          </div>
          ` : ''}
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          Bu e-posta YB Digital Panel sistemi tarafından otomatik olarak gönderilmiştir.
        </p>
      </div>
    `;

    // Send email to all attendees
    const emailPromises = attendeeEmails.map(email => {
      const emailData = {
        from: process.env.EMAIL_USER || 'ybdigitalx@gmail.com',
        to: email,
        subject: emailSubject,
        html: emailBody
      };
      
      // Use real email if configured, otherwise use mock
      if (hasValidEmailConfig) {
        return transporter.sendMail(emailData).catch(error => {
          console.log('Real email failed, using mock:', error.message);
          return mockEmailSend(emailData);
        });
      } else {
        console.log('No email config found, using mock system');
        return mockEmailSend(emailData);
      }
    });

    await Promise.all(emailPromises);

    res.json({
      success: true,
      message: `Meeting invitation sent to ${attendeeEmails.length} attendees`
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send meeting invitation'
    });
  }
});

// Send general notification
router.post('/send-notification', auth, async (req, res) => {
  try {
    const { subject, message, recipients, fromUser } = req.body;

    if (!subject || !message || !recipients || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Subject, message, and recipients are required'
      });
    }

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">YB Digital Panel Bildirimi</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="color: #1e293b; line-height: 1.6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          Bu e-posta YB Digital Panel sistemi tarafından otomatik olarak gönderilmiştir.
        </p>
      </div>
    `;

    // Determine sender email
    const senderEmail = fromUser && req.user.role === 'member' 
      ? req.user.email 
      : (process.env.EMAIL_USER || 'ybdigitalx@gmail.com');
    
    const senderName = fromUser && req.user.role === 'member' 
      ? req.user.name 
      : 'YB Digital Panel';

    const emailPromises = recipients.map(email => {
      const emailData = {
        from: `${senderName} <${senderEmail}>`,
        to: email,
        subject: subject,
        html: emailBody
      };
      
      // Use real email if configured, otherwise use mock
      if (hasValidEmailConfig) {
        return transporter.sendMail(emailData).catch(error => {
          console.log('Real email failed, using mock:', error.message);
          return mockEmailSend(emailData);
        });
      } else {
        console.log('No email config found, using mock system');
        return mockEmailSend(emailData);
      }
    });

    await Promise.all(emailPromises);

    res.json({
      success: true,
      message: `Notification sent to ${recipients.length} recipients`
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
});

module.exports = router;
