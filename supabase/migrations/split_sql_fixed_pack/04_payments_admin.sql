$$;

$$;

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL DEFAULT 1,
  unit_price DECIMAL NOT NULL,
  discount DECIMAL DEFAULT 0,
  vat_rate DECIMAL DEFAULT 0.07,
  amount DECIMAL NOT NULL
);

CREATE TABLE fb_menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id UUID REFERENCES fb_outlets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INT DEFAULT 0
);

CREATE TABLE fb_menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id UUID REFERENCES fb_outlets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES fb_menu_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  cost DECIMAL,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  tags JSONB DEFAULT '[]', -- ['vegan', 'spicy', 'gluten_free']
  translations JSONB DEFAULT '{}'
);

CREATE TABLE fb_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES fb_orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES fb_menu_items(id),
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL NOT NULL,
  modifiers JSONB DEFAULT '[]',
  notes TEXT,
  amount DECIMAL NOT NULL
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- REMOVED MULTIPLE BROKEN OTA MODULE STATEMENTS

ALTER TABLE admin_impersonation_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS platform_admin_subscription_events ON subscription_events;

-- REMOVED BROKEN MODULE: statement referencing ota_reservation_events
