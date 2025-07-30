-- Add map_position column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN map_position JSONB DEFAULT '{"x": 0, "y": 0, "zone": "starting_area"}'::jsonb;