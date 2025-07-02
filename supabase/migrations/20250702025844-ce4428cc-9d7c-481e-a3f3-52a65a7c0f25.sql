-- Extend the users table with additional profile fields
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone VARCHAR;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS travel_preferences JSONB DEFAULT '{}';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dietary_restrictions JSONB DEFAULT '[]';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS accessibility_needs JSONB DEFAULT '[]';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"profile_visibility": "friends", "location_sharing": false}';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}';

-- Create a function to handle new user creation from auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
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
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create user profile when auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create reviews table for travel history
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  location_name VARCHAR NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  photos JSONB DEFAULT '[]',
  review_type VARCHAR DEFAULT 'location', -- location, accommodation, activity, restaurant
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Users can read all reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updating updated_at on reviews
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();