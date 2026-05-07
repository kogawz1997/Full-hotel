-- ============================================
-- 01 BOOTSTRAP CORE
-- Supabase public schema reset + required helpers
-- Run this first.
-- ============================================

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper function stub.
-- Later you can replace this with real JWT/profile lookup logic.
CREATE OR REPLACE FUNCTION public.user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULL::uuid;
$$;

-- Helper function stub.
-- Later you can replace this with real platform admin lookup logic.
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT false;
$$;
