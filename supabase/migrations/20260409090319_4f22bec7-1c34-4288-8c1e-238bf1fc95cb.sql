
CREATE TABLE public.daily_routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wake_up_time TEXT NOT NULL,
  sleep_time TEXT NOT NULL,
  goals TEXT[] NOT NULL DEFAULT '{}',
  stress_level TEXT NOT NULL DEFAULT 'medium',
  free_time TEXT,
  interests TEXT[] NOT NULL DEFAULT '{}',
  routine_data JSONB,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own routines" ON public.daily_routines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own routines" ON public.daily_routines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own routines" ON public.daily_routines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own routines" ON public.daily_routines FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_daily_routines_updated_at BEFORE UPDATE ON public.daily_routines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.routine_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID NOT NULL REFERENCES public.daily_routines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  time_slot TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.routine_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks" ON public.routine_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON public.routine_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.routine_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.routine_tasks FOR DELETE USING (auth.uid() = user_id);
