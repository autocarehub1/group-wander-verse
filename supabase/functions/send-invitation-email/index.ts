import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
    
    console.log('Sending invitation email:', { invitationId, inviteEmail, tripTitle });

    const joinUrl = `https://d0253439-cb12-43b0-aff1-fddf3f910d61.lovableproject.com/join/${invitationToken}`;

    const emailResponse = await resend.emails.send({
      from: "TripPlanner <onboarding@resend.dev>",
      to: [inviteEmail],
      subject: `${inviterName} invited you to join "${tripTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">You're Invited!</h1>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #2563eb; margin-top: 0;">${tripTitle}</h2>
            <p style="color: #666; font-size: 16px; margin: 10px 0;">
              <strong>Destination:</strong> ${tripDestination}
            </p>
            <p style="color: #666; font-size: 16px; margin: 10px 0;">
              <strong>Invited by:</strong> ${inviterName}
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${joinUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold;
                      display: inline-block;">
              Join Trip
            </a>
          </div>

          <p style="color: #666; font-size: 14px; text-align: center;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #2563eb; font-size: 14px; text-align: center; word-break: break-all;">
            ${joinUrl}
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            This invitation was sent by ${inviterName}. If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);