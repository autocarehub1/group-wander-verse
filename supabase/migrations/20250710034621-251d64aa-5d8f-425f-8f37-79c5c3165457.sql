-- Fix the handle_new_user function to prevent duplicate key violations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
SET search_path = ''
AS $$
BEGIN
  -- Use INSERT ... ON CONFLICT DO NOTHING to prevent duplicate key violations
  INSERT INTO public.users (id, email, full_name, avatar_url, travel_preferences, dietary_restrictions, accessibility_needs, notification_preferences, privacy_settings)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.raw_user_meta_data ->> 'avatar_url',
    COALESCE((NEW.raw_user_meta_data ->> 'travel_preferences')::jsonb, '{}'),
    COALESCE((NEW.raw_user_meta_data ->> 'dietary_restrictions')::jsonb, '[]'),
    COALESCE((NEW.raw_user_meta_data ->> 'accessibility_needs')::jsonb, '[]'),
    '{"email": true, "push": true, "sms": false}',
    '{"profile_visibility": "friends", "location_sharing": false}'
  )
  ON CONFLICT (email) DO NOTHING;
  
  RETURN NEW;
END;
$$;