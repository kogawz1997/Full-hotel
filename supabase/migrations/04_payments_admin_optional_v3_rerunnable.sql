-- ============================================
-- 04 PAYMENTS / ADMIN / OPTIONAL
-- ============================================

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL DEFAULT 1,
  unit_price DECIMAL NOT NULL,
  discount DECIMAL DEFAULT 0,
  vat_rate DECIMAL DEFAULT 0.07,
  amount DECIMAL NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
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


-- Safe RLS enable. Policies can be hardened after bootstrapping.

DO $$
BEGIN
  IF to_regclass('public.invoice_items') IS NOT NULL THEN
    ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
