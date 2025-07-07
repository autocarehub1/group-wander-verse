import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, tripId } = await req.json();

    if (!destination || !tripId) {
      return new Response(JSON.stringify({ error: 'Destination and tripId are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generating suggestions for destination: ${destination}, tripId: ${tripId}`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate AI suggestions
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a travel expert that provides detailed recommendations for destinations. 
            Provide suggestions in JSON format with the following structure:
            {
              "activities": [
                {
                  "title": "Activity Name",
                  "description": "Brief description",
                  "location": "Specific location",
                  "category": "attraction|restaurant|entertainment|outdoor|culture|shopping|nightlife",
                  "estimated_cost": 50.00,
                  "estimated_duration": 2
                }
              ],
              "accommodations": [
                {
                  "name": "Hotel Name",
                  "type": "hotel|hostel|apartment|resort",
                  "location": "Address or area",
                  "price_per_night": 150.00,
                  "capacity": 2,
                  "amenities": ["wifi", "pool", "gym"]
                }
              ]
            }
            
            Provide 8-10 diverse activities and 5-6 accommodation options. Include a mix of budget ranges and categories.`
          },
          {
            role: 'user',
            content: `Generate travel recommendations for ${destination}. Include popular attractions, local experiences, restaurants, and accommodation options with realistic pricing.`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('OpenAI response:', content);

    let suggestions;
    try {
      // Try to parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI response');
    }

    // Insert activity suggestions
    if (suggestions.activities && suggestions.activities.length > 0) {
      const activityInserts = suggestions.activities.map(activity => ({
        trip_id: tripId,
        title: activity.title,
        description: activity.description,
        location: activity.location,
        category: activity.category || 'attraction',
        estimated_cost: activity.estimated_cost || null,
        estimated_duration: activity.estimated_duration || null,
      }));

      const { error: activitiesError } = await supabase
        .from('activity_suggestions')
        .insert(activityInserts);

      if (activitiesError) {
        console.error('Error inserting activities:', activitiesError);
      } else {
        console.log(`Inserted ${activityInserts.length} activity suggestions`);
      }
    }

    // Insert accommodation suggestions
    if (suggestions.accommodations && suggestions.accommodations.length > 0) {
      const accommodationInserts = suggestions.accommodations.map(accommodation => ({
        trip_id: tripId,
        name: accommodation.name,
        type: accommodation.type || 'hotel',
        location: accommodation.location,
        price_per_night: accommodation.price_per_night || null,
        capacity: accommodation.capacity || null,
        amenities: accommodation.amenities || [],
      }));

      const { error: accommodationsError } = await supabase
        .from('accommodation_options')
        .insert(accommodationInserts);

      if (accommodationsError) {
        console.error('Error inserting accommodations:', accommodationsError);
      } else {
        console.log(`Inserted ${accommodationInserts.length} accommodation suggestions`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Suggestions generated successfully',
      activitiesCount: suggestions.activities?.length || 0,
      accommodationsCount: suggestions.accommodations?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-location-suggestions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});