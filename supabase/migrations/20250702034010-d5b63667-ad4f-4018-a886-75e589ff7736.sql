-- Fix infinite recursion in trip_participants RLS policies
-- Drop problematic policies
DROP POLICY IF EXISTS "Users can read trip participants" ON public.trip_participants;
DROP POLICY IF EXISTS "Trip owners can view all participants" ON public.trip_participants;

-- Create security definer function to check trip participation
CREATE OR REPLACE FUNCTION public.is_trip_participant_check(trip_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = trip_uuid AND user_id = user_uuid AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate policies using the security definer function
CREATE POLICY "Users can read trip participants" ON public.trip_participants
FOR SELECT USING (
  public.is_trip_participant_check(trip_id, auth.uid())
);

CREATE POLICY "Trip owners can view all participants" ON public.trip_participants
FOR SELECT USING (
  public.check_trip_ownership(trip_id, auth.uid())
);