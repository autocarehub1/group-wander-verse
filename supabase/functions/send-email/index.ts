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
    
    console.log("Processing email request for:", to);

    const joinUrl = `https://d0253439-cb12-43b0-aff1-fddf3f910d61.lovableproject.com/join/${invitationToken}`;
    
    // Use EmailJS service (no server setup required)
    const emailData = {
      service_id: 'default_service',
      template_id: 'template_invitation',
      user_id: Deno.env.get("EMAILJS_USER_ID"),
      template_params: {
        to_email: to,
        to_name: to.split('@')[0],
        from_name: inviterName,
        trip_title: tripTitle,
        trip_destination: tripDestination,
        join_url: joinUrl,
        message: `You've been invited to join "${tripTitle}" to ${tripDestination}. Click the link to join: ${joinUrl}`
      }
    };

    // Try EmailJS first
    try {
      const emailJSResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (emailJSResponse.ok) {
        console.log("Email sent successfully via EmailJS");
        return new Response(
          JSON.stringify({ success: true, method: "EmailJS" }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } catch (emailJSError) {
      console.log("EmailJS failed, trying fallback method");
    }

    // Fallback: Generate a mailto link and return it
    const subject = encodeURIComponent(`${inviterName} invited you to join "${tripTitle}"`);
    const body = encodeURIComponent(`
Hi there!

${inviterName} has invited you to join a trip:

Trip: ${tripTitle}
Destination: ${tripDestination}

To join this trip, click the following link:
${joinUrl}

If the link doesn't work, copy and paste it into your browser.

Happy travels!
    `);
    
    const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}`;

    console.log("Returning mailto link as fallback");

    return new Response(
      JSON.stringify({ 
        success: true, 
        method: "mailto_fallback",
        mailtoLink,
        message: "Email service unavailable. Please copy the invitation link manually.",
        invitationLink: joinUrl
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error in email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});