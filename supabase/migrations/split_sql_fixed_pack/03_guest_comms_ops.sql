CREATE INDEX idx_conversations_hotel ON conversations(hotel_id);

CREATE INDEX idx_conversations_status ON conversations(status);

CREATE INDEX idx_conversations_last_msg ON conversations(last_message_at DESC);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  sender_type TEXT CHECK (sender_type IN ('guest', 'staff', 'ai', 'system')),
  sender_id UUID, -- user_profile id ถ้า sender_type='staff'
  
  -- Original message (ภาษาแขก)
  original_text TEXT,
  original_language TEXT,
  
  -- Translated (สำหรับ unified inbox - แสดงเป็นไทย)
  translated_text TEXT,
  
  -- Voice / media
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'location', 'sticker', 'template')),
  media_url TEXT,
  media_metadata JSONB,
  
  -- Channel-specific
  channel_message_id TEXT, -- ID ของ message ที่ channel
  
  -- AI processing
  ai_generated BOOLEAN DEFAULT false,
  ai_confidence DECIMAL,
  ai_reviewed_by UUID REFERENCES user_profiles(id), -- ถ้าคนตรวจก่อนส่ง
  
  -- Status
  status TEXT DEFAULT 'sent' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

ALTER TABLE housekeeping_tasks ENABLE ROW LEVEL SECURITY;