-- Add session_id to chat_messages for grouping messages into sessions
ALTER TABLE public.chat_messages 
ADD COLUMN session_id uuid DEFAULT gen_random_uuid();

-- Create an index for faster session lookups
CREATE INDEX idx_chat_messages_session ON public.chat_messages(user_id, session_id, created_at);