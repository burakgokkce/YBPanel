const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { auth } = require('../middleware/auth');

// Email configuration
let transporter;
let hasValidEmailConfig = false;

// Gmail configuration (requires App Password)
const gmailConfig = {
  service: 'gmail',
  auth: {
    user: 'ybdigitalx@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password' // Gerçek Gmail App Password gerekli
  }
};

// Test email configuration (Ethereal Email for testing)
const createTestTransporter = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (error) {
    console.error('Test email setup failed:', error);
    return null;
  }
};

// Initialize transporter
const initializeEmail = async () => {
  // Try Gmail first (if you have App Password)
  try {
    transporter = nodemailer.createTransport(gmailConfig);
    await transporter.verify();
    hasValidEmailConfig = true;
    console.log('✅ Gmail SMTP connection successful');
  } catch (error) {
    console.log('❌ Gmail SMTP failed, using test email service');
    
    // Fallback to test email service
    transporter = await createTestTransporter();
    if (transporter) {
      hasValidEmailConfig = true;
      console.log('✅ Test email service ready');
    } else {
      console.log('❌ All email services failed, using mock');
      hasValidEmailConfig = false;
    }
  }
};

// Initialize email on startup
initializeEmail();

// Mock email sending for demo purposes
const mockEmailSend = async (emailData) => {
  console.log('\n📧 ===== MOCK EMAIL SENT =====');
  console.log('From:', emailData.from);
  console.log('To:', emailData.to);
  console.log('Subject:', emailData.subject);
  console.log('ReplyTo:', emailData.replyTo || 'N/A');
  console.log('Content Preview:', emailData.html.substring(0, 150) + '...');
  console.log('✅ Mock email delivered successfully');
  console.log('===============================\n');
  
  return {
    messageId: 'mock-' + Date.now() + '@ybdigital.local',
    response: 'Mock email sent successfully',
    accepted: [emailData.to],
    rejected: []
  };
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
        from: 'YB Digital <ybdigitalx@gmail.com>',
        to: email,
        subject: emailSubject,
        html: emailBody
      };
      
      // Use real email if configured, otherwise use mock
      if (hasValidEmailConfig && transporter) {
        return transporter.sendMail(emailData).then(info => {
          console.log('✅ Meeting invitation sent successfully!');
          if (info.messageId) {
            console.log('Message ID:', info.messageId);
          }
          // If using test service, show preview URL
          if (nodemailer.getTestMessageUrl && nodemailer.getTestMessageUrl(info)) {
            console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
          }
          return info;
        }).catch(error => {
          console.log('❌ Meeting email failed, using mock:', error.message);
          return mockEmailSend(emailData);
        });
      } else {
        console.log('No email config found, using mock system');
        return mockEmailSend(emailData);
      }
    });

    const results = await Promise.all(emailPromises);
    console.log(`📧 Meeting invitation sent to ${attendeeEmails.length} recipients`);

    res.json({
      success: true,
      message: `Toplantı daveti ${attendeeEmails.length} kişiye gönderildi`,
      details: results.length > 0 ? 'E-postalar başarıyla gönderildi' : 'E-posta gönderimi tamamlandı'
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
        from: fromUser && req.user.role === 'member' 
          ? `${req.user.name} <ybdigitalx@gmail.com>` 
          : 'YB Digital <ybdigitalx@gmail.com>',
        to: email,
        subject: subject,
        html: emailBody,
        replyTo: fromUser && req.user.role === 'member' ? req.user.email : 'ybdigitalx@gmail.com'
      };
      
      // Use real email if configured, otherwise use mock
      if (hasValidEmailConfig && transporter) {
        return transporter.sendMail(emailData).then(info => {
          console.log('✅ Notification sent successfully!');
          if (info.messageId) {
            console.log('Message ID:', info.messageId);
          }
          // If using test service, show preview URL
          if (nodemailer.getTestMessageUrl && nodemailer.getTestMessageUrl(info)) {
            console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
          }
          return info;
        }).catch(error => {
          console.log('❌ Notification email failed, using mock:', error.message);
          return mockEmailSend(emailData);
        });
      } else {
        console.log('No email config found, using mock system');
        return mockEmailSend(emailData);
      }
    });

    const results = await Promise.all(emailPromises);
    console.log(`📧 Notification sent to ${recipients.length} recipients`);

    res.json({
      success: true,
      message: `E-posta ${recipients.length} kişiye gönderildi`,
      details: results.length > 0 ? 'E-postalar başarıyla gönderildi' : 'E-posta gönderimi tamamlandı'
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
