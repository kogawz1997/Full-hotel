-- REMOVED BROKEN OTA MODULE STATEMENT referencing ota_reservation_events

-- ============================================
-- ORGANIZATIONS & USERS (Multi-tenant)
-- ============================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subscription_plan TEXT DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'standard', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled')),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '60 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('hotel', 'hostel', 'pool_villa', 'serviced_apartment', 'resort', 'boutique')),
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Thailand',
  timezone TEXT DEFAULT 'Asia/Bangkok',
  currency TEXT DEFAULT 'THB',
  phone TEXT,
  email TEXT,
  website TEXT,
  check_in_time TIME DEFAULT '14:00',
  check_out_time TIME DEFAULT '12:00',
  tax_id TEXT, -- เลขประจำตัวผู้เสียภาษี
  vat_rate DECIMAL DEFAULT 0.07,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'manager', 'front_desk', 'housekeeping', 'staff')),
  language TEXT DEFAULT 'th',
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROOMS & RATES
-- ============================================

CREATE TABLE room_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "ห้องดีลักซ์", "Deluxe", "Suite"
  code TEXT, -- DLX, STD, SUITE
  description TEXT,
  max_occupancy INT DEFAULT 2,
  base_rate DECIMAL NOT NULL,
  amenities JSONB DEFAULT '[]', -- ["wifi", "tv", "balcony"]
  size_sqm INT,
  bed_type TEXT, -- "king", "queen", "twin"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  room_type_id UUID REFERENCES room_types(id),
  room_number TEXT NOT NULL,
  floor INT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'cleaning', 'maintenance', 'blocked')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hotel_id, room_number)
);

CREATE TABLE rate_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  room_type_id UUID REFERENCES room_types(id),
  name TEXT NOT NULL, -- "Standard", "Non-refundable", "Breakfast Included"
  rate_modifier DECIMAL DEFAULT 1.0, -- multiplier on base_rate
  includes_breakfast BOOLEAN DEFAULT false,
  cancellation_policy TEXT,
  active BOOLEAN DEFAULT true
);

CREATE TABLE rate_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  room_type_id UUID REFERENCES room_types(id),
  rate_plan_id UUID REFERENCES rate_plans(id),
  date DATE NOT NULL,
  rate DECIMAL NOT NULL,
  available_count INT,
  min_stay INT DEFAULT 1,
  max_stay INT,
  closed_to_arrival BOOLEAN DEFAULT false,
  closed_to_departure BOOLEAN DEFAULT false,
  UNIQUE(hotel_id, room_type_id, rate_plan_id, date)
);

-- ============================================
-- GUESTS & RESERVATIONS
-- ============================================

CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  nationality TEXT,
  passport_number TEXT,
  id_card_number TEXT,
  date_of_birth DATE,
  preferred_language TEXT DEFAULT 'en',
  preferences JSONB DEFAULT '{}', -- { "pillow": "soft", "allergies": [...] }
  vip_status BOOLEAN DEFAULT false,
  loyalty_points INT DEFAULT 0,
  loyalty_tier TEXT DEFAULT 'bronze',
  notes TEXT,
  marketing_consent BOOLEAN DEFAULT false,
  total_stays INT DEFAULT 0,
  total_revenue DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id),
  room_id UUID REFERENCES rooms(id),
  room_type_id UUID REFERENCES room_types(id),
  rate_plan_id UUID REFERENCES rate_plans(id),
  reservation_code TEXT UNIQUE NOT NULL DEFAULT 'BK' || UPPER(SUBSTRING(uuid_generate_v4()::TEXT, 1, 8)),
  
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INT GENERATED ALWAYS AS (check_out - check_in) STORED,
  
  num_adults INT DEFAULT 1,
  num_children INT DEFAULT 0,
  
  status TEXT DEFAULT 'confirmed' CHECK (status IN (
    'pending', 'confirmed', 'checked_in', 'checked_out', 
    'cancelled', 'no_show', 'on_hold'
  )),
  
  source TEXT DEFAULT 'direct' CHECK (source IN (
    'direct', 'website', 'walk_in', 'phone',
    'booking_com', 'agoda', 'expedia', 'airbnb', 
    'trip_com', 'traveloka', 'hostelworld', 
    'line', 'whatsapp', 'wechat', 'instagram',
    'tiktok', 'facebook', 'other'
  )),
  external_id TEXT, -- ID จาก OTA
  
  total_amount DECIMAL NOT NULL,
  paid_amount DECIMAL DEFAULT 0,
  balance_amount DECIMAL GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  
  special_requests TEXT,
  internal_notes TEXT,
  
  -- Group booking
  group_booking_id UUID,
  is_group_master BOOLEAN DEFAULT false,
  
  -- Compliance
  tm30_reported BOOLEAN DEFAULT false, -- ทร.30 reported
  tm30_reported_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT
);

CREATE INDEX idx_reservations_hotel ON reservations(hotel_id);

CREATE INDEX idx_reservations_dates ON reservations(check_in, check_out);

CREATE INDEX idx_reservations_room ON reservations(room_id);

CREATE INDEX idx_reservations_guest ON reservations(guest_id);

CREATE INDEX idx_reservations_status ON reservations(status);

-- Folio (กระดาษคำนวณค่าใช้จ่ายแขก)
CREATE TABLE folios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  hotel_id UUID REFERENCES hotels(id),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'transferred')),
  total_charges DECIMAL DEFAULT 0,
  total_payments DECIMAL DEFAULT 0,
  balance DECIMAL DEFAULT 0,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE folio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folio_id UUID REFERENCES folios(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('room', 'tax', 'fb', 'spa', 'minibar', 'service', 'damage', 'discount', 'payment', 'refund')),
  description TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  quantity INT DEFAULT 1,
  posted_by UUID REFERENCES user_profiles(id),
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  reference_id UUID, -- link to fb_order, spa_booking, etc.
  reference_type TEXT
);

-- ============================================
-- HOUSEKEEPING
-- ============================================

CREATE TABLE housekeeping_tasks (
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

CREATE TABLE maintenance_requests (
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

-- ============================================
-- COMMUNICATION (Multi-channel Inbox)
-- ============================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id),
  reservation_id UUID REFERENCES reservations(id),
  
  channel TEXT NOT NULL CHECK (channel IN (
    'line', 'whatsapp', 'wechat', 'kakaotalk', 
    'messenger', 'instagram', 'email', 'sms', 
    'webchat', 'booking_com', 'agoda', 'airbnb', 
    'expedia', 'phone'
  )),
  channel_user_id TEXT NOT NULL, -- ID จาก channel นั้น
  channel_thread_id TEXT, -- thread/conversation ID
  
  guest_language TEXT DEFAULT 'en',
  guest_name TEXT,
  
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'snoozed', 'closed', 'spam')),
  assigned_to UUID REFERENCES user_profiles(id),
  
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  unread_count INT DEFAULT 0,
  
  ai_handling BOOLEAN DEFAULT true, -- AI ตอบเองได้มั้ย
  needs_human BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(hotel_id, channel, channel_user_id)
);

-- Quick reply templates
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "Check-in instructions", "WiFi info"
  category TEXT, -- "pre_arrival", "during_stay", "post_stay"
  content_th TEXT NOT NULL,
  translations JSONB DEFAULT '{}', -- { "en": "...", "zh": "...", "ja": "..." }
  variables JSONB DEFAULT '[]', -- ["guest_name", "check_in_date"]
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REMOVED BROKEN OTA MODULE STATEMENT referencing channel_connections

-- ============================================
-- COMPLIANCE & ACCOUNTING (Thai Tax)
-- ============================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id),
  guest_id UUID REFERENCES guests(id),
  
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_type TEXT CHECK (invoice_type IN ('tax_invoice', 'receipt', 'credit_note', 'debit_note')),
  
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  
  subtotal DECIMAL NOT NULL,
  vat_amount DECIMAL NOT NULL,
  total_amount DECIMAL NOT NULL,
  
  -- Buyer info (สำหรับใบกำกับภาษี)
  buyer_name TEXT,
  buyer_tax_id TEXT,
  buyer_address TEXT,
  buyer_branch TEXT,
  
  -- e-Tax Invoice
  is_etax BOOLEAN DEFAULT false,
  etax_status TEXT, -- 'draft', 'submitted', 'approved', 'rejected'
  etax_signed_xml TEXT,
  etax_pdf_url TEXT,
  etax_submitted_at TIMESTAMPTZ,
  etax_response JSONB,
  
  status TEXT DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'sent', 'paid', 'cancelled')),
  
  pdf_url TEXT,
  sent_to_email TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ทร.30 (Foreign guest report)
CREATE TABLE tm30_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id),
  reservation_id UUID REFERENCES reservations(id),
  passport_number TEXT NOT NULL,
  nationality TEXT NOT NULL,
  arrival_date DATE NOT NULL,
  departure_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'confirmed', 'failed')),
  submitted_at TIMESTAMPTZ,
  confirmation_number TEXT,
  response_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tax filings (ภพ.30, ภงด.)
CREATE TABLE tax_filings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  filing_type TEXT CHECK (filing_type IN ('por_por_30', 'por_ngor_dor_1', 'por_ngor_dor_3', 'por_ngor_dor_53', 'por_ngor_dor_50', 'por_ngor_dor_51')),
  period_year INT NOT NULL,
  period_month INT,
  total_revenue DECIMAL,
  total_vat DECIMAL,
  total_withholding DECIMAL,
  status TEXT DEFAULT 'draft',
  filed_at TIMESTAMPTZ,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounting integration
CREATE TABLE accounting_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  provider TEXT CHECK (provider IN ('peak', 'flowaccount', 'express', 'acccloud', 'xero')),
  entity_type TEXT, -- 'invoice', 'payment', 'expense'
  entity_id UUID,
  external_id TEXT,
  status TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  error TEXT
);

-- OTA Reconciliation
CREATE TABLE ota_reconciliations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id),
  ota_channel TEXT NOT NULL,
  expected_amount DECIMAL NOT NULL,
  ota_invoiced_amount DECIMAL,
  ota_paid_amount DECIMAL,
  commission_amount DECIMAL,
  variance DECIMAL,
  status TEXT, -- 'matched', 'discrepancy', 'unpaid'
  reconciled_at TIMESTAMPTZ,
  notes TEXT
);

-- ============================================
-- F&B (Food & Beverage)
-- ============================================

CREATE TABLE fb_outlets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "Main Restaurant", "Pool Bar"
  type TEXT, -- 'restaurant', 'bar', 'room_service', 'banquet'
  active BOOLEAN DEFAULT true
);

CREATE TABLE fb_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES fb_outlets(id),
  reservation_id UUID REFERENCES reservations(id),
  table_number TEXT,
  order_number TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'preparing', 'served', 'paid', 'cancelled')),
  subtotal DECIMAL DEFAULT 0,
  service_charge DECIMAL DEFAULT 0,
  tax DECIMAL DEFAULT 0,
  total DECIMAL DEFAULT 0,
  payment_method TEXT, -- 'room_charge', 'cash', 'card'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SPA & WELLNESS
-- ============================================

CREATE TABLE spa_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_min INT NOT NULL,
  price DECIMAL NOT NULL,
  category TEXT, -- 'massage', 'facial', 'body_treatment'
  active BOOLEAN DEFAULT true
);

CREATE TABLE spa_therapists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialties JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true
);

CREATE TABLE spa_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id),
  guest_id UUID REFERENCES guests(id),
  service_id UUID REFERENCES spa_services(id),
  therapist_id UUID REFERENCES spa_therapists(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'booked',
  amount DECIMAL,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MICE / EVENTS
-- ============================================

CREATE TABLE event_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INT,
  size_sqm INT,
  hourly_rate DECIMAL,
  daily_rate DECIMAL,
  amenities JSONB DEFAULT '[]'
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  space_id UUID REFERENCES event_spaces(id),
  name TEXT NOT NULL,
  organizer_name TEXT,
  organizer_contact TEXT,
  event_type TEXT, -- 'wedding', 'meeting', 'conference', 'banquet'
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  num_attendees INT,
  total_amount DECIMAL,
  status TEXT DEFAULT 'inquiry',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOYALTY PROGRAM
-- ============================================

CREATE TABLE loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_points INT NOT NULL,
  benefits JSONB DEFAULT '[]',
  multiplier DECIMAL DEFAULT 1.0
);

CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id),
  reservation_id UUID REFERENCES reservations(id),
  type TEXT CHECK (type IN ('earn', 'redeem', 'expire', 'adjust')),
  points INT NOT NULL,
  description TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MARKETING
-- ============================================

CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT, -- 'email', 'sms', 'line_broadcast', 'whatsapp_broadcast'
  status TEXT DEFAULT 'draft',
  audience_filter JSONB,
  template_id UUID,
  scheduled_at TIMESTAMPTZ,
  sent_count INT DEFAULT 0,
  opened_count INT DEFAULT 0,
  clicked_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES reservations(id),
  guest_id UUID REFERENCES guests(id),
  source TEXT, -- 'google', 'booking_com', 'agoda', 'tripadvisor', 'direct'
  rating INT CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  content TEXT,
  language TEXT,
  sentiment TEXT, -- 'positive', 'neutral', 'negative' (from AI)
  ai_response_draft TEXT,
  response_text TEXT,
  responded_at TIMESTAMPTZ,
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI & AUTOMATION
-- ============================================

CREATE TABLE ai_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  task_type TEXT, -- 'translate', 'reply', 'review_response', 'sentiment'
  input_text TEXT,
  output_text TEXT,
  model TEXT,
  input_tokens INT,
  output_tokens INT,
  cost_usd DECIMAL,
  duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id),
  rating INT, -- 1-5
  feedback TEXT,
  evaluator_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge base for RAG
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
  category TEXT, -- 'faq', 'policy', 'amenity', 'local_info'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT DEFAULT 'th',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID REFERENCES hotels(id),
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

ALTER TABLE folios ENABLE ROW LEVEL SECURITY;

ALTER TABLE folio_items ENABLE ROW LEVEL SECURITY;