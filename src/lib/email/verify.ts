'use server';

import { getUserEmailFromID } from '@/lib/supabase/db/user';
import { sendEmail } from './index';

/**
 * Generates the HTML email template for approved verification
 */
function getApprovedEmailHTML(userName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Approved</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background-color: #1a1a1a;
      color: #f9f9f9;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    .email-card {
      background-color: #252525;
      border: 2px solid #2d2d2d;
      overflow: hidden;
    }
    
    .email-header {
      background: linear-gradient(135deg, #01d06c 0%, #00b85d 100%);
      padding: 50px 30px;
      text-align: center;
    }
    
    .email-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
    }
    

    
    .email-body {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 20px;
      color: #f9f9f9;
    }
    
    .message {
      font-size: 15px;
      line-height: 1.6;
      color: #b5b5b5;
      margin: 0 0 24px;
    }
    
    .cta-button {
      display: inline-block;
      background-color: #01d06c;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 15px;
      margin: 20px 0;
      transition: opacity 0.2s ease;
    }
    
    .cta-button:hover {
      opacity: 0.9;
    }
    
    .features-list {
      background-color: #1e1e1e;
      border: 2px solid #2d2d2d;
      padding: 20px 24px;
      margin: 24px 0;
    }
    
    .feature-item {
      display: flex;
      align-items: flex-start;
      margin: 12px 0;
      font-size: 14px;
      color: #d4d4d4;
    }
    
    .feature-icon {
      color: #01d06c;
      margin-right: 12px;
      font-weight: 700;
      font-size: 16px;
    }
    
    .email-footer {
      padding: 30px;
      text-align: center;
      border-top: 1px solid #2d2d2d;
    }
    
    .footer-text {
      font-size: 13px;
      color: #888;
      margin: 5px 0;
    }
    
    .brand-name {
      color: #01d06c;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-card">
      <div class="email-header">
        <h1>Verification Approved!</h1>
      </div>
      
      <div class="email-body">
        <p class="greeting">Hello ${userName},</p>
        
        <p class="message">
          Congratulations! Your identity verification has been successfully approved. 
          You now have full access to all SABOT features and can start using the platform 
          with verified status.
        </p>
        
        <div class="features-list">
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>Create and participate in secure transactions</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>Access to verified-only features</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>Enhanced trust score and credibility</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>Priority support and assistance</span>
          </div>
        </div>
        
        <p class="message">
          Your verified badge is now active on your profile. This helps build trust 
          with other users in the SABOT community.
        </p>
        
        <center>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://sabot.app'}/user" class="cta-button">
            View Your Profile
          </a>
        </center>
        
        <p class="message" style="margin-top: 30px; font-size: 14px;">
          If you have any questions or need assistance, feel free to reach out to our support team.
        </p>
      </div>
      
      <div class="email-footer">
        <p class="footer-text">© ${new Date().getFullYear()} SABOT. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generates the HTML email template for rejected verification
 */
function getRejectedEmailHTML(userName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Update</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background-color: #1a1a1a;
      color: #f9f9f9;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    .email-card {
      background-color: #252525;
      border: 2px solid #2d2d2d;
      overflow: hidden;
    }
    
    .email-header {
      background: linear-gradient(135deg, #3d1f1f 0%, #2d1515 100%);
      padding: 50px 30px;
      text-align: center;
      border-bottom: 3px solid #ff4444;
    }
    
    .email-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #f9f9f9;
    }
    

    
    .email-body {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 20px;
      color: #f9f9f9;
    }
    
    .message {
      font-size: 15px;
      line-height: 1.6;
      color: #b5b5b5;
      margin: 0 0 24px;
    }
    
    .info-box {
      background-color: #1e1e1e;
      border-left: 5px solid #ff4444;
      padding: 20px 24px;
      margin: 24px 0;
    }
    
    .info-title {
      font-size: 15px;
      font-weight: 600;
      color: #f9f9f9;
      margin: 0 0 12px;
    }
    
    .info-text {
      font-size: 14px;
      line-height: 1.6;
      color: #d4d4d4;
      margin: 8px 0;
    }
    
    .reasons-list {
      background-color: #1e1e1e;
      border: 2px solid #2d2d2d;
      padding: 20px 24px;
      margin: 24px 0;
    }
    
    .reason-item {
      display: flex;
      align-items: flex-start;
      margin: 12px 0;
      font-size: 14px;
      color: #d4d4d4;
    }
    
    .reason-icon {
      color: #888;
      margin-right: 12px;
      font-weight: 700;
      font-size: 16px;
    }
    
    .cta-button {
      display: inline-block;
      background-color: #ff4444;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 15px;
      margin: 20px 0;
      transition: opacity 0.2s ease;
    }
    
    .cta-button:hover {
      opacity: 0.9;
    }
    
    .email-footer {
      padding: 30px;
      text-align: center;
      border-top: 1px solid #2d2d2d;
    }
    
    .footer-text {
      font-size: 13px;
      color: #888;
      margin: 5px 0;
    }
    
    .brand-name {
      color: #01d06c;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-card">
      <div class="email-header">
        <h1>Verification Update</h1>
      </div>
      
      <div class="email-body">
        <p class="greeting">Hello ${userName},</p>
        
        <p class="message">
          Thank you for submitting your identity verification. After careful review, 
          we were unable to approve your verification at this time.
        </p>
        
        <div class="reasons-list">
          <p style="font-weight: 600; color: #f9f9f9; margin: 0 0 16px;">Common reasons for rejection:</p>
          <div class="reason-item">
            <span class="reason-icon">•</span>
            <span>Unclear or low-quality document photos</span>
          </div>
          <div class="reason-item">
            <span class="reason-icon">•</span>
            <span>Document information doesn't match selfie</span>
          </div>
          <div class="reason-item">
            <span class="reason-icon">•</span>
            <span>Expired identification documents</span>
          </div>
          <div class="reason-item">
            <span class="reason-icon">•</span>
            <span>Incomplete verification process</span>
          </div>
        </div>
        
        <div class="info-box">
          <p class="info-title">What's next?</p>
          <p class="info-text">
            You can resubmit your verification at any time. Please ensure your documents 
            are clear, valid, and all photos are well-lit. Make sure your face is clearly 
            visible during the liveness check.
          </p>
        </div>
        
        <p class="message">
          While your account remains active, certain features may require verified status. 
          You can still use basic platform features.
        </p>
        
        <center>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://sabot.app'}/user" class="cta-button">
            Try Verification Again
          </a>
        </center>
        
        <p class="message" style="margin-top: 30px; font-size: 14px;">
          If you believe this was a mistake or need assistance, please contact our support team. 
          We're here to help!
        </p>
      </div>
      
      <div class="email-footer">
        <p class="footer-text">© ${new Date().getFullYear()} SABOT. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Server action to send approved verification email
 */
export async function sendApprovedEmail(userId: string): Promise<boolean> {
  try {
    console.log(`📧 Sending approved email to user: ${userId}`);

    // Fetch user email and name by ID
    const userData = await getUserEmailFromID(userId);

    if (!userData || !userData.email) {
      console.error(`❌ No email found for user ${userId}`);
      return false;
    }

    const userName = userData.name;
    const userEmail = userData.email;

    // Send email
    await sendEmail(
      { to: userEmail },
      'Verification',
      '✅ Your Verification Has Been Approved',
      getApprovedEmailHTML(userName)
    );

    console.log(`✅ Approved email sent successfully to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending approved email:', error);
    return false;
  }
}

/**
 * Server action to send rejected verification email
 */
export async function sendRejectedEmail(userId: string): Promise<boolean> {
  try {
    console.log(`📧 Sending rejected email to user: ${userId}`);

    // Fetch user email and name by ID
    const userData = await getUserEmailFromID(userId);

    if (!userData || !userData.email) {
      console.error(`❌ No email found for user ${userId}`);
      return false;
    }

    const userName = userData.name;
    const userEmail = userData.email;

    // Send email
    await sendEmail(
      { to: userEmail },
      'Verification',
      'Verification Update - Action Required',
      getRejectedEmailHTML(userName)
    );

    console.log(`✅ Rejected email sent successfully to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending rejected email:', error);
    return false;
  }
}
