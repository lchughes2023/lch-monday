-- ============================================================
-- Memory Palace OS — Database Migration
-- Run this in your Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Add active_palace_id to existing user_progress table ──

ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS active_palace_id uuid;

-- ── 2. Palaces table ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS palaces (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL DEFAULT 'My Palace',
  template_id text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS palaces_user_id_idx ON palaces(user_id);

-- ── 3. Palace zones ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS palace_zones (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  palace_id  uuid NOT NULL REFERENCES palaces(id) ON DELETE CASCADE,
  name       text NOT NULL,
  color      text NOT NULL DEFAULT '#64b4ff',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS palace_zones_palace_id_idx ON palace_zones(palace_id, sort_order);

-- ── 4. Palace rooms ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS palace_rooms (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  palace_id   uuid NOT NULL REFERENCES palaces(id) ON DELETE CASCADE,
  zone_id     uuid NOT NULL REFERENCES palace_zones(id) ON DELETE CASCADE,
  name        text NOT NULL,
  emoji       text NOT NULL DEFAULT '🏠',
  theme       text,
  description text,
  route_when  text,
  sort_order  integer NOT NULL DEFAULT 0,
  legacy_slug text,       -- used for migrating existing journal entries
  bp_x        integer,    -- blueprint SVG coordinates (nullable)
  bp_y        integer,
  bp_w        integer,
  bp_h        integer,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS palace_rooms_palace_id_idx ON palace_rooms(palace_id);
CREATE INDEX IF NOT EXISTS palace_rooms_zone_id_idx ON palace_rooms(zone_id);

-- ── 5. Palace scenarios ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS palace_scenarios (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  palace_id       uuid NOT NULL REFERENCES palaces(id) ON DELETE CASCADE,
  prompt          text NOT NULL,
  correct_room_id uuid NOT NULL REFERENCES palace_rooms(id) ON DELETE CASCADE,
  explanation     text,
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS palace_scenarios_palace_id_idx ON palace_scenarios(palace_id);

-- ── 6. Add FK from user_progress to palaces ───────────────────
-- (ADD CONSTRAINT IF NOT EXISTS is not valid Postgres — use a DO block)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_progress_active_palace_id_fkey'
      AND table_name = 'user_progress'
  ) THEN
    ALTER TABLE user_progress
      ADD CONSTRAINT user_progress_active_palace_id_fkey
      FOREIGN KEY (active_palace_id)
      REFERENCES palaces(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- ── 7. Row Level Security ─────────────────────────────────────

-- palaces: users own their own palaces
ALTER TABLE palaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own their palaces" ON palaces;
CREATE POLICY "Users own their palaces"
  ON palaces FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- palace_zones: access via palace ownership
ALTER TABLE palace_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own their palace zones" ON palace_zones;
CREATE POLICY "Users own their palace zones"
  ON palace_zones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM palaces
      WHERE palaces.id = palace_zones.palace_id
        AND palaces.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM palaces
      WHERE palaces.id = palace_zones.palace_id
        AND palaces.user_id = auth.uid()
    )
  );

-- palace_rooms: access via palace ownership
ALTER TABLE palace_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own their palace rooms" ON palace_rooms;
CREATE POLICY "Users own their palace rooms"
  ON palace_rooms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM palaces
      WHERE palaces.id = palace_rooms.palace_id
        AND palaces.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM palaces
      WHERE palaces.id = palace_rooms.palace_id
        AND palaces.user_id = auth.uid()
    )
  );

-- palace_scenarios: access via palace ownership
ALTER TABLE palace_scenarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own their palace scenarios" ON palace_scenarios;
CREATE POLICY "Users own their palace scenarios"
  ON palace_scenarios FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM palaces
      WHERE palaces.id = palace_scenarios.palace_id
        AND palaces.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM palaces
      WHERE palaces.id = palace_scenarios.palace_id
        AND palaces.user_id = auth.uid()
    )
  );

-- ── 8. Confirm ────────────────────────────────────────────────
SELECT 'Migration complete ✓' AS status;
