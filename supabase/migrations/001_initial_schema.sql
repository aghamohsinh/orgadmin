-- ============================================================
-- OrgAdmin - Initial Schema
-- Run against a fresh Supabase project via the SQL editor
-- or supabase db push
-- ============================================================

-- ── Profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  full_name   TEXT,
  is_admin    BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- Every new auth user gets a profile row automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- ── Organizations ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organizations (
  id               UUID        NOT NULL DEFAULT gen_random_uuid(),
  name             TEXT        NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  type             TEXT        NOT NULL CHECK (type IN ('school', 'nonprofit', 'business')),
  created_by       UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- type-specific fields (nullable; enforced at app level + Edge Function)
  school_district  TEXT,
  tax_id           TEXT,
  industry         TEXT,
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Admins can only manage their own orgs
CREATE POLICY "Admins can insert own orgs"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can select own orgs"
  ON public.organizations FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can update own orgs"
  ON public.organizations FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete own orgs"
  ON public.organizations FOR DELETE
  USING (auth.uid() = created_by);


-- ── Organization Members ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organization_members (
  id               UUID        NOT NULL DEFAULT gen_random_uuid(),
  organization_id  UUID        NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  email            TEXT        NOT NULL,
  user_id          UUID        REFERENCES auth.users (id) ON DELETE SET NULL,
  status           TEXT        NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active')),
  role             TEXT        NOT NULL DEFAULT 'member'  CHECK (role  IN ('admin', 'member')),
  invited_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at        TIMESTAMPTZ,
  CONSTRAINT organization_members_pkey PRIMARY KEY (id),
  -- Prevent duplicate invitations per org
  CONSTRAINT organization_members_org_email_key UNIQUE (organization_id, email)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- The org admin (created_by) can read/write members of their orgs
CREATE POLICY "Org admin can select members"
  ON public.organization_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = organization_id
        AND o.created_by = auth.uid()
    )
  );

CREATE POLICY "Org admin can insert members"
  ON public.organization_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = organization_id
        AND o.created_by = auth.uid()
    )
  );

CREATE POLICY "Org admin can update members"
  ON public.organization_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = organization_id
        AND o.created_by = auth.uid()
    )
  );

CREATE POLICY "Org admin can delete members"
  ON public.organization_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = organization_id
        AND o.created_by = auth.uid()
    )
  );

-- Members can view their own invitation row
CREATE POLICY "Member can view own invitation"
  ON public.organization_members FOR SELECT
  USING (user_id = auth.uid() OR email = (SELECT email FROM public.profiles WHERE id = auth.uid()));


-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON public.organizations (created_by);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id       ON public.organization_members (organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id      ON public.organization_members (user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_email        ON public.organization_members (email);
