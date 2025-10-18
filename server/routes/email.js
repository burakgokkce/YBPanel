const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth');

// Email configuration (you can use environment variables for production)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

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
      return transporter.sendMail({
        from: process.env.EMAIL_USER || 'noreply@ybdigital.com',
        to: email,
        subject: emailSubject,
        html: emailBody
      });
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
    const { subject, message, recipients } = req.body;

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

    const emailPromises = recipients.map(email => {
      return transporter.sendMail({
        from: process.env.EMAIL_USER || 'noreply@ybdigital.com',
        to: email,
        subject: subject,
        html: emailBody
      });
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
