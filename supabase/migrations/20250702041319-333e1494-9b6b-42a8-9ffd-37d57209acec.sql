-- Enhance trips table with more planning details
ALTER TABLE public.trips 
ADD COLUMN IF NOT EXISTS trip_type TEXT DEFAULT 'leisure' CHECK (trip_type IN ('leisure', 'business', 'adventure', 'family', 'group')),
ADD COLUMN IF NOT EXISTS budget_total DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS planning_status TEXT DEFAULT 'draft' CHECK (planning_status IN ('draft', 'planning', 'confirmed', 'completed'));

-- Create itinerary table for daily planning
CREATE TABLE IF NOT EXISTS public.itinerary_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(trip_id, day_date)
);

-- Create itinerary items/activities
CREATE TABLE IF NOT EXISTS public.itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES public.itinerary_days(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIME,
  end_time TIME,
  location TEXT,
  category TEXT DEFAULT 'activity' CHECK (category IN ('activity', 'meal', 'transport', 'accommodation', 'meeting')),
  cost DECIMAL(10,2),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'cancelled', 'completed')),
  created_by UUID REFERENCES public.users(id),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create activity suggestions with voting
CREATE TABLE IF NOT EXISTS public.activity_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  category TEXT DEFAULT 'attraction',
  estimated_cost DECIMAL(10,2),
  estimated_duration INTEGER, -- minutes
  suggested_by UUID REFERENCES public.users(id),
  external_id TEXT, -- for API data
  external_data JSONB, -- store API response data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create voting system for suggestions
CREATE TABLE IF NOT EXISTS public.activity_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activity_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote', 'interested', 'not_interested')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(activity_id, user_id)
);

-- Create accommodation options with voting
CREATE TABLE IF NOT EXISTS public.accommodation_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'hotel' CHECK (type IN ('hotel', 'rental', 'hostel', 'bnb', 'resort')),
  location TEXT,
  price_per_night DECIMAL(10,2),
  check_in_date DATE,
  check_out_date DATE,
  capacity INTEGER,
  amenities TEXT[],
  external_url TEXT,
  external_data JSONB,
  suggested_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create accommodation voting
CREATE TABLE IF NOT EXISTS public.accommodation_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id UUID NOT NULL REFERENCES public.accommodation_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote', 'favorite')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(accommodation_id, user_id)
);

-- Create enhanced expense tracking
CREATE TABLE IF NOT EXISTS public.trip_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT DEFAULT 'other' CHECK (category IN ('accommodation', 'transport', 'food', 'activities', 'shopping', 'other')),
  paid_by UUID REFERENCES public.users(id),
  expense_date DATE DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  is_shared BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create expense splits
CREATE TABLE IF NOT EXISTS public.expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES public.trip_expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(expense_id, user_id)
);

-- Create document storage table
CREATE TABLE IF NOT EXISTS public.trip_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  document_type TEXT DEFAULT 'general' CHECK (document_type IN ('passport', 'visa', 'ticket', 'reservation', 'insurance', 'general')),
  uploaded_by UUID REFERENCES public.users(id),
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodation_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodation_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_documents ENABLE ROW LEVEL SECURITY;

-- Add update triggers
CREATE TRIGGER update_itinerary_days_updated_at
  BEFORE UPDATE ON public.itinerary_days
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_itinerary_items_updated_at
  BEFORE UPDATE ON public.itinerary_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activity_suggestions_updated_at
  BEFORE UPDATE ON public.activity_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accommodation_options_updated_at
  BEFORE UPDATE ON public.accommodation_options
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trip_expenses_updated_at
  BEFORE UPDATE ON public.trip_expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trip_documents_updated_at
  BEFORE UPDATE ON public.trip_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();