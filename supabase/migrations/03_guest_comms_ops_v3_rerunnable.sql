-- ============================================
-- 03 GUEST COMMUNICATIONS / OPERATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS housekeeping_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id),
  assigned_to UUID REFERENCES user_profiles(id),
  task_type TEXT CHECK (task_type IN ('cleaning', 'turnover', 'deep_cleaning', 'inspection', 'maintenance', 'lost_found')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'failed_inspection')),
  notes TEXT,
  estimated_duration_min INT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id),
  reported_by UUID REFERENCES user_profiles(id),
  assigned_to UUID REFERENCES user_profiles(id),
  category TEXT, -- "plumbing", "electrical", "ac", "tv", "other"
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'pending',
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  channel TEXT DEFAULT 'webchat',
  channel_user_id TEXT,
  status TEXT DEFAULT 'open',
  subject TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hotel_id, channel, channel_user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT DEFAULT 'guest',
  sender_id UUID,
  body TEXT,
  original_text TEXT,
  original_language TEXT,
  translated_text TEXT,
  translated_language TEXT,
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_confidence NUMERIC,
  ai_handling BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Safe RLS enable. Policies can be hardened after bootstrapping.

DO $$
BEGIN
  IF to_regclass('public.housekeeping_tasks') IS NOT NULL THEN
    ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.maintenance_requests') IS NOT NULL THEN
    ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.conversations') IS NOT NULL THEN
    ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.messages') IS NOT NULL THEN
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;


-- Safe indexes from original migrations
CREATE INDEX IF NOT EXISTS idx_conversations_hotel ON conversations(hotel_id);

CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);

CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
