import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  name?: string;
  confirmationUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, confirmationUrl }: ConfirmationEmailRequest = await req.json();

    console.log("Sending confirmation email to:", email);

    const displayName = name || email.split('@')[0];
    const finalConfirmationUrl = confirmationUrl || `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify`;

    const emailResponse = await resend.emails.send({
      from: "WanderTogether <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to WanderTogether! Please confirm your email",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to WanderTogether</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3b82f6; margin-bottom: 10px;">Welcome to WanderTogether!</h1>
              <p style="color: #6b7280; font-size: 18px;">Your adventure planning journey starts here</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: white; margin-bottom: 20px;">Hi ${displayName}! 👋</h2>
              <p style="color: white; font-size: 16px; margin-bottom: 25px;">
                Thank you for joining WanderTogether! We're excited to help you plan amazing trips with your friends and family.
              </p>
              ${confirmationUrl ? `
                <a href="${confirmationUrl}" style="background: white; color: #3b82f6; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                  Confirm Your Email
                </a>
              ` : ''}
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #374151; margin-bottom: 15px;">🌟 What you can do with WanderTogether:</h3>
              <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
                <li>Plan trips collaboratively with friends</li>
                <li>Manage group expenses and split bills</li>
                <li>Create detailed itineraries together</li>
                <li>Chat with your travel group</li>
                <li>Get AI-powered location suggestions</li>
              </ul>
            </div>
            
            <div style="text-align: center; color: #9ca3af; font-size: 14px; margin-top: 30px;">
              <p>If you didn't create an account with WanderTogether, you can safely ignore this email.</p>
              <p style="margin-top: 20px;">
                Happy travels! ✈️<br>
                The WanderTogether Team
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: "Confirmation email sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    
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