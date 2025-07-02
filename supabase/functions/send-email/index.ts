import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  tripTitle: string;
  tripDestination: string;
  inviterName: string;
  invitationToken: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, tripTitle, tripDestination, inviterName, invitationToken }: EmailRequest = await req.json();
    
    console.log("Sending invitation email to:", to);

    const joinUrl = `https://d0253439-cb12-43b0-aff1-fddf3f910d61.lovableproject.com/join/${invitationToken}`;
    
    const emailData = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: `${inviterName} invited you to join "${tripTitle}"`
        }
      ],
      from: { email: "noreply@yourdomain.com", name: "TripPlanner" },
      content: [
        {
          type: "text/html",
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; text-align: center;">You're Invited to a Trip!</h1>
              
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
                  Join This Trip
                </a>
              </div>

              <p style="color: #666; font-size: 14px; text-align: center;">
                Or copy and paste this link: <br>
                <a href="${joinUrl}" style="color: #2563eb;">${joinUrl}</a>
              </p>

              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                This invitation was sent by ${inviterName}. If you didn't expect this, you can ignore this email.
              </p>
            </div>
          `
        }
      ]
    };

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SENDGRID_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SendGrid error:", errorText);
      throw new Error(`SendGrid API error: ${response.status} ${errorText}`);
    }

    console.log("Email sent successfully via SendGrid");

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});