/*
  # Add Communication Tracking and Bulk Operations Schema

  1. New Tables
    - `communications`
      - Track all communication touchpoints with candidates
      - Support bulk communications
    - `communication_recipients`
      - Link communications to specific resumes/candidates
      - Track delivery status

  2. Features Support
    - Bulk communication tracking
    - Communication history per candidate
    - Mass export functionality (tracked in user activity)

  3. Security
    - Enable RLS on all new tables
    - Users can only access their own communication data
*/

-- Create communications table for tracking all communication touchpoints
CREATE TABLE IF NOT EXISTS public.communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  communication_type TEXT NOT NULL CHECK (communication_type IN ('email', 'sms', 'note', 'bulk_update')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'failed')),
  total_recipients INTEGER NOT NULL DEFAULT 0,
  successful_deliveries INTEGER NOT NULL DEFAULT 0,
  failed_deliveries INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communication_recipients table to link communications to specific candidates
CREATE TABLE IF NOT EXISTS public.communication_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  communication_id UUID NOT NULL REFERENCES public.communications(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(communication_id, resume_id)
);

-- Create user_activities table for tracking bulk operations like mass exports
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('mass_export', 'bulk_communication', 'bulk_delete', 'data_cleanup')),
  description TEXT NOT NULL,
  items_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for communications table
CREATE POLICY "Users can view their own communications"
  ON public.communications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own communications"
  ON public.communications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own communications"
  ON public.communications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own communications"
  ON public.communications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for communication_recipients table
CREATE POLICY "Users can view their own communication recipients"
  ON public.communication_recipients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own communication recipients"
  ON public.communication_recipients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own communication recipients"
  ON public.communication_recipients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own communication recipients"
  ON public.communication_recipients
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for user_activities table
CREATE POLICY "Users can view their own activities"
  ON public.user_activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
  ON public.user_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
  ON public.user_activities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
  ON public.user_activities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_communications_user_id ON public.communications(user_id);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON public.communications(created_at);
CREATE INDEX IF NOT EXISTS idx_communications_type ON public.communications(communication_type);

CREATE INDEX IF NOT EXISTS idx_communication_recipients_communication_id ON public.communication_recipients(communication_id);
CREATE INDEX IF NOT EXISTS idx_communication_recipients_resume_id ON public.communication_recipients(resume_id);
CREATE INDEX IF NOT EXISTS idx_communication_recipients_user_id ON public.communication_recipients(user_id);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(activity_type);

-- Create trigger function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at columns
CREATE TRIGGER update_communications_updated_at
  BEFORE UPDATE ON public.communications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_recipients_updated_at
  BEFORE UPDATE ON public.communication_recipients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_activities_updated_at
  BEFORE UPDATE ON public.user_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
