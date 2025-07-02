-- RLS policies for itinerary_days
CREATE POLICY "Trip participants can view itinerary days" ON public.itinerary_days
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = itinerary_days.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Trip participants can create itinerary days" ON public.itinerary_days
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = itinerary_days.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Trip participants can update itinerary days" ON public.itinerary_days
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = itinerary_days.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Trip participants can delete itinerary days" ON public.itinerary_days
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = itinerary_days.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

-- RLS policies for itinerary_items
CREATE POLICY "Trip participants can view itinerary items" ON public.itinerary_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = itinerary_items.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Trip participants can create itinerary items" ON public.itinerary_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = itinerary_items.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Trip participants can update itinerary items" ON public.itinerary_items
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = itinerary_items.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Trip participants can delete itinerary items" ON public.itinerary_items
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = itinerary_items.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

-- RLS policies for activity_suggestions
CREATE POLICY "Trip participants can view activity suggestions" ON public.activity_suggestions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = activity_suggestions.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Trip participants can create activity suggestions" ON public.activity_suggestions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = activity_suggestions.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Trip participants can update activity suggestions" ON public.activity_suggestions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = activity_suggestions.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Trip participants can delete activity suggestions" ON public.activity_suggestions
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = activity_suggestions.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

-- RLS policies for activity_votes
CREATE POLICY "Trip participants can view activity votes" ON public.activity_votes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants tp
    JOIN public.activity_suggestions act ON act.id = activity_votes.activity_id
    WHERE tp.trip_id = act.trip_id 
    AND tp.user_id = auth.uid() 
    AND tp.status = 'active'
  )
);

CREATE POLICY "Trip participants can create activity votes" ON public.activity_votes
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.trip_participants tp
    JOIN public.activity_suggestions act ON act.id = activity_votes.activity_id
    WHERE tp.trip_id = act.trip_id 
    AND tp.user_id = auth.uid() 
    AND tp.status = 'active'
  )
);

CREATE POLICY "Users can update their own activity votes" ON public.activity_votes
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own activity votes" ON public.activity_votes
FOR DELETE USING (user_id = auth.uid());

-- RLS policies for accommodation_options
CREATE POLICY "Trip participants can view accommodation options" ON public.accommodation_options
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = accommodation_options.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Trip participants can create accommodation options" ON public.accommodation_options
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = accommodation_options.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Trip participants can update accommodation options" ON public.accommodation_options
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = accommodation_options.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Trip participants can delete accommodation options" ON public.accommodation_options
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = accommodation_options.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

-- RLS policies for accommodation_votes
CREATE POLICY "Trip participants can view accommodation votes" ON public.accommodation_votes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants tp
    JOIN public.accommodation_options acc ON acc.id = accommodation_votes.accommodation_id
    WHERE tp.trip_id = acc.trip_id 
    AND tp.user_id = auth.uid() 
    AND tp.status = 'active'
  )
);

CREATE POLICY "Trip participants can create accommodation votes" ON public.accommodation_votes
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.trip_participants tp
    JOIN public.accommodation_options acc ON acc.id = accommodation_votes.accommodation_id
    WHERE tp.trip_id = acc.trip_id 
    AND tp.user_id = auth.uid() 
    AND tp.status = 'active'
  )
);

CREATE POLICY "Users can update their own accommodation votes" ON public.accommodation_votes
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own accommodation votes" ON public.accommodation_votes
FOR DELETE USING (user_id = auth.uid());

-- RLS policies for trip_expenses
CREATE POLICY "Trip participants can view trip expenses" ON public.trip_expenses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = trip_expenses.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Trip participants can create trip expenses" ON public.trip_expenses
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = trip_expenses.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Trip participants can update trip expenses" ON public.trip_expenses
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = trip_expenses.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Trip participants can delete trip expenses" ON public.trip_expenses
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = trip_expenses.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

-- RLS policies for expense_splits
CREATE POLICY "Trip participants can view expense splits" ON public.expense_splits
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants tp
    JOIN public.trip_expenses te ON te.id = expense_splits.expense_id
    WHERE tp.trip_id = te.trip_id 
    AND tp.user_id = auth.uid() 
    AND tp.status = 'active'
  )
);

CREATE POLICY "Trip participants can create expense splits" ON public.expense_splits
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trip_participants tp
    JOIN public.trip_expenses te ON te.id = expense_splits.expense_id
    WHERE tp.trip_id = te.trip_id 
    AND tp.user_id = auth.uid() 
    AND tp.status = 'active'
  )
);

CREATE POLICY "Trip participants can update expense splits" ON public.expense_splits
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants tp
    JOIN public.trip_expenses te ON te.id = expense_splits.expense_id
    WHERE tp.trip_id = te.trip_id 
    AND tp.user_id = auth.uid() 
    AND tp.status = 'active'
  )
);

CREATE POLICY "Trip participants can delete expense splits" ON public.expense_splits
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.trip_participants tp
    JOIN public.trip_expenses te ON te.id = expense_splits.expense_id
    WHERE tp.trip_id = te.trip_id 
    AND tp.user_id = auth.uid() 
    AND tp.status = 'active'
  )
);

-- RLS policies for trip_documents
CREATE POLICY "Trip participants can view trip documents" ON public.trip_documents
FOR SELECT USING (
  (NOT is_private OR uploaded_by = auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = trip_documents.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Trip participants can create trip documents" ON public.trip_documents
FOR INSERT WITH CHECK (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.trip_participants 
    WHERE trip_id = trip_documents.trip_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Users can update their own trip documents" ON public.trip_documents
FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own trip documents" ON public.trip_documents
FOR DELETE USING (uploaded_by = auth.uid());