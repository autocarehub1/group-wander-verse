import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable must be set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const emailData: any = {
      to: params.to,
      from: params.from,
      subject: params.subject,
    };
    
    if (params.text) emailData.text = params.text;
    if (params.html) emailData.html = params.html;
    
    console.log('Attempting to send email with Resend:', {
      to: params.to,
      from: params.from,
      subject: params.subject
    });
    
    const result = await resend.emails.send(emailData);
    
    console.log('Resend API response:', result);
    
    if (result.error) {
      console.error('Resend returned error:', result.error);
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error('Resend email error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return false;
  }
}

export async function sendInvitationEmail({
  recipientEmail,
  tripTitle,
  tripDestination,
  inviterName,
  invitationToken,
  customMessage
}: {
  recipientEmail: string;
  tripTitle: string;
  tripDestination: string;
  inviterName: string;
  invitationToken: string;
  customMessage?: string;
}): Promise<boolean> {
  const inviteLink = `${process.env.BASE_URL || 'http://localhost:5000'}/join/${invitationToken}`;
  
  const subject = `You're invited to join "${tripTitle}" in ${tripDestination}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #20B2AA; font-size: 28px; margin-bottom: 10px;">WanderTogether</h1>
        <p style="color: #666; font-size: 16px;">You're invited to join a trip!</p>
      </div>
      
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
        <h2 style="color: #333; margin-top: 0;">${tripTitle}</h2>
        <p style="color: #666; font-size: 16px; margin: 10px 0;">
          <strong>Destination:</strong> ${tripDestination}
        </p>
        <p style="color: #666; font-size: 16px; margin: 10px 0;">
          <strong>Invited by:</strong> ${inviterName}
        </p>
        ${customMessage ? `
        <div style="margin: 15px 0;">
          <strong>Message:</strong>
          <p style="color: #555; font-style: italic; margin: 5px 0;">"${customMessage}"</p>
        </div>
        ` : ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteLink}" 
           style="background-color: #20B2AA; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
          Join Trip
        </a>
      </div>
      
      <div style="text-align: center; color: #888; font-size: 14px;">
        <p>Or copy and paste this link: <a href="${inviteLink}" style="color: #20B2AA;">${inviteLink}</a></p>
        <p style="margin-top: 20px;">This invitation will expire in 7 days.</p>
      </div>
    </div>
  `;
  
  const textContent = `
You're invited to join "${tripTitle}" in ${tripDestination}!

Invited by: ${inviterName}
${customMessage ? `\nMessage: "${customMessage}"` : ''}

Click here to join the trip: ${inviteLink}

This invitation will expire in 7 days.

---
WanderTogether - Collaborative Trip Planning
  `;

  // Use a verified email address for Resend
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  
  console.log(`Sending invitation email to ${recipientEmail} for trip "${tripTitle}"`);
  
  const emailSent = await sendEmail({
    to: recipientEmail,
    from: fromEmail,
    subject,
    text: textContent,
    html: htmlContent
  });
  
  if (emailSent) {
    console.log(`✅ Email invitation sent successfully to ${recipientEmail}`);
  } else {
    console.error(`❌ Failed to send email invitation to ${recipientEmail}`);
  }
  
  return emailSent;
}
