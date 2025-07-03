import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { expenseId, amount, description } = await req.json();
    
    if (!expenseId || !amount) {
      throw new Error("Missing required fields: expenseId and amount");
    }

    // Verify user has access to this expense
    const { data: expenseData, error: expenseError } = await supabaseClient
      .from('expense_splits')
      .select(`
        id,
        amount,
        expense_id,
        trip_expenses!inner(
          trip_id,
          title,
          trip_participants!inner(user_id)
        )
      `)
      .eq('expense_id', expenseId)
      .eq('user_id', user.id)
      .single();

    if (expenseError || !expenseData) {
      throw new Error("Expense not found or access denied");
    }

    const stripe = new Stripe(Deno.env.get("Stripe") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `Expense Settlement: ${expenseData.trip_expenses.title}`,
              description: description || "Trip expense settlement"
            },
            unit_amount: Math.round(parseFloat(amount) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/trips?payment=success&expense=${expenseId}`,
      cancel_url: `${req.headers.get("origin")}/trips?payment=cancelled`,
      metadata: {
        expense_id: expenseId,
        user_id: user.id,
        split_amount: amount
      }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});