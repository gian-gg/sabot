'use server';

import { sendEmail } from './index';
import { createClient } from '@/lib/supabase/server';

/**
 * Generates the HTML email template for agreement invitation
 */
function getAgreementInviteEmailHTML(
  senderName: string,
  agreementLink: string
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agreement Invitation</title>
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
    
    .info-box {
      background-color: #1e1e1e;
      border: 2px solid #2d2d2d;
      padding: 20px 24px;
      margin: 24px 0;
    }
    
    .info-item {
      display: flex;
      align-items: flex-start;
      margin: 12px 0;
      font-size: 14px;
      color: #d4d4d4;
    }
    
    .info-icon {
      color: #01d06c;
      margin-right: 12px;
      font-weight: 700;
      font-size: 16px;
    }
    
    .link-box {
      background-color: #1e1e1e;
      border: 2px solid #2d2d2d;
      padding: 16px;
      margin: 20px 0;
      word-break: break-all;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #01d06c;
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
        <h1>Agreement Invitation</h1>
      </div>
      
      <div class="email-body">
        <p class="greeting">Hello,</p>
        
        <p class="message">
          <strong>${senderName}</strong> has invited you to participate in a secure agreement 
          on SABOT. Click the button below to join and configure the agreement details together.
        </p>
        
        <div class="info-box">
          <div class="info-item">
            <span class="info-icon">✓</span>
            <span>Secure peer-to-peer agreement platform</span>
          </div>
          <div class="info-item">
            <span class="info-icon">✓</span>
            <span>Identity verification required for both parties</span>
          </div>
          <div class="info-item">
            <span class="info-icon">✓</span>
            <span>Transparent and collaborative process</span>
          </div>
        </div>
        
        <center>
          <a href="${agreementLink}" class="cta-button">
            Join Agreement
          </a>
        </center>
        
        <p class="message" style="margin-top: 30px; font-size: 14px;">
          Or copy and paste this link into your browser:
        </p>
        <div class="link-box">
          ${agreementLink}
        </div>
        
        <p class="message" style="margin-top: 30px; font-size: 14px; color: #888;">
          If you didn't expect this invitation, you can safely ignore this email. 
          The agreement link will expire if not used.
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
 * Server action to send agreement invitation email
 * Gets the current user automatically from the session
 * @param recipientEmail - The recipient's email address
 * @param agreementLink - The unique agreement link to join
 */
export async function sendAgreementInviteWithCurrentUser(
  recipientEmail: string,
  agreementLink: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`📧 Sending agreement invite to: ${recipientEmail}`);

    // Validate inputs
    if (!recipientEmail || !agreementLink) {
      console.error('❌ Missing required parameters for agreement invite');
      return { success: false, error: 'Missing required parameters' };
    }

    // Get current user from session
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ Failed to get current user:', authError);
      return { success: false, error: 'Authentication required' };
    }

    // Get sender name from user metadata
    const senderName = user.user_metadata?.name || 'A SABOT user';

    // Send email
    await sendEmail(
      { to: recipientEmail },
      'Agreement',
      `${senderName} invited you to an agreement on SABOT`,
      getAgreementInviteEmailHTML(senderName, agreementLink)
    );

    console.log(`✅ Agreement invite sent successfully to ${recipientEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending agreement invite email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Server action to send agreement invitation email
 * @param email - The recipient's email address
 * @param senderName - The name of the user sending the invitation
 * @param agreementLink - The unique agreement link to join
 */
export async function sendAgreementInvite(
  email: string,
  senderName: string,
  agreementLink: string
): Promise<boolean> {
  try {
    console.log(`📧 Sending agreement invite to: ${email}`);

    // Validate inputs
    if (!email || !senderName || !agreementLink) {
      console.error('❌ Missing required parameters for agreement invite');
      return false;
    }

    // Send email
    await sendEmail(
      { to: email },
      'Agreement',
      `${senderName} invited you to an agreement on SABOT`,
      getAgreementInviteEmailHTML(senderName, agreementLink)
    );

    console.log(`✅ Agreement invite sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending agreement invite email:', error);
    return false;
  }
}
