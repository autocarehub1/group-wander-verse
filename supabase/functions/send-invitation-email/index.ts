import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  invitationId: string;
  inviteEmail: string;
  tripTitle: string;
  tripDestination: string;
  inviterName: string;
  invitationToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invitationId, inviteEmail, tripTitle, tripDestination, inviterName, invitationToken }: InvitationEmailRequest = await req.json();
    
    console.log("Sending invitation email to:", inviteEmail);

    const joinUrl = `https://preview--group-wander-verse.lovable.app/join/${invitationToken}`;

    const emailResponse = await resend.emails.send({
      from: "WanderTogether <onboarding@resend.dev>",
      to: [inviteEmail],
      subject: `${inviterName} invited you to join "${tripTitle}"`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>You're Invited to ${tripTitle}</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3b82f6; margin-bottom: 10px;">You're Invited! 🎉</h1>
              <p style="color: #6b7280; font-size: 18px;">Join an amazing trip adventure</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: white; margin-bottom: 20px;">${tripTitle}</h2>
              <p style="color: white; font-size: 16px; margin-bottom: 15px;">
                <strong>📍 Destination:</strong> ${tripDestination}
              </p>
              <p style="color: white; font-size: 16px; margin-bottom: 25px;">
                <strong>👤 Invited by:</strong> ${inviterName}
              </p>
              <a href="${joinUrl}" style="background: white; color: #3b82f6; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                Join Trip
              </a>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #374151; margin-bottom: 15px;">🌟 What you can do:</h3>
              <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
                <li>Plan activities together</li>
                <li>Split expenses fairly</li>
                <li>Chat with the group</li>
                <li>Create shared itineraries</li>
              </ul>
            </div>
            
            <div style="text-align: center; color: #9ca3af; font-size: 14px; margin-top: 30px;">
              <p>If the button doesn't work, copy and paste this link:</p>
              <p style="color: #3b82f6; word-break: break-all; margin: 10px 0;">${joinUrl}</p>
              <p style="margin-top: 20px;">
                This invitation was sent by ${inviterName}. If you didn't expect this, you can safely ignore this email.
              </p>
              <p style="margin-top: 20px;">
                Happy travels! ✈️<br>
                The WanderTogether Team
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: "Invitation email sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-invitation-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);