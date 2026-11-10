/*
# Viva progress (per device, no sign-in)

1. New Tables
- `viva_progress`: one row per viva card a learner has rated on a given device.
  - `id` (uuid, primary key)
  - `device_id` (uuid, not null): random key generated and kept by the learner's browser
  - `card_id` (text, not null): identifier of the viva card
  - `status` (text, not null): 'known' or 'review'
  - `updated_at` (timestamptz)
  - Unique on (device_id, card_id)

2. Security
- RLS enabled.
- The app has no sign-in, so the browser sends its device key in an `x-device-id` request header.
  Every policy only matches rows whose device_id equals that header, so a device can only see and
  change its own progress. The key is a random UUID known only to that browser.
- Grants: SELECT, INSERT, UPDATE, DELETE to anon and authenticated (only those verbs are used).

3. Notes
1. `viva_device_id()` reads the header safely and returns NULL if it is missing or malformed, so
   requests without a valid key match no rows.
*/

CREATE TABLE IF NOT EXISTS viva_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL,
  card_id text NOT NULL CHECK (char_length(card_id) BETWEEN 1 AND 80),
  status text NOT NULL CHECK (status IN ('known', 'review')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, card_id)
);

CREATE OR REPLACE FUNCTION viva_device_id() RETURNS uuid
LANGUAGE plpgsql STABLE
SET search_path = ''
AS $$
DECLARE
  raw text;
BEGIN
  raw := (current_setting('request.headers', true)::json) ->> 'x-device-id';
  IF raw ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN raw::uuid;
  END IF;
  RETURN NULL;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION viva_device_id() TO anon, authenticated;

ALTER TABLE viva_progress ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON viva_progress TO anon, authenticated;

DROP POLICY IF EXISTS "select_own_device_progress" ON viva_progress;
CREATE POLICY "select_own_device_progress" ON viva_progress FOR SELECT
  TO anon, authenticated USING (device_id = viva_device_id());

DROP POLICY IF EXISTS "insert_own_device_progress" ON viva_progress;
CREATE POLICY "insert_own_device_progress" ON viva_progress FOR INSERT
  TO anon, authenticated WITH CHECK (device_id = viva_device_id());

DROP POLICY IF EXISTS "update_own_device_progress" ON viva_progress;
CREATE POLICY "update_own_device_progress" ON viva_progress FOR UPDATE
  TO anon, authenticated USING (device_id = viva_device_id()) WITH CHECK (device_id = viva_device_id());

DROP POLICY IF EXISTS "delete_own_device_progress" ON viva_progress;
CREATE POLICY "delete_own_device_progress" ON viva_progress FOR DELETE
  TO anon, authenticated USING (device_id = viva_device_id());
