import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  console.log('🧪 Test invitation email function called');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('✅ Testing email with Resend...');
    
    const emailResponse = await resend.emails.send({
      from: "WanderTogether Test <onboarding@resend.dev>",
      to: ["test@example.com"],
      subject: "🧪 Test Invitation Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">🧪 Test Email Working!</h1>
          <p style="color: #666; font-size: 16px;">This is a test email to verify the Resend integration is working.</p>
          <p style="color: #666; font-size: 16px;">Time sent: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    console.log("✅ Test email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      test: true,
      resendResponse: emailResponse.data,
      message: "Test email function working!" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Test email error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        test: true 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});