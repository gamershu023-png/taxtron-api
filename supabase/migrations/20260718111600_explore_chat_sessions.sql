/*
# Taxtron Explore — Chat Persistence Tables

## Summary
Creates two tables to persist chat history for signed-in users in /explore.
Guest sessions are not persisted.

## Tables

### explore_sessions
Stores one row per chat session (conversation thread).
- id: uuid primary key
- user_id: owner, defaults to auth.uid(), foreign key to auth.users
- title: short display title (first message text, capped at 40 chars)
- topic: the engineering topic active when the session was started
- created_at: creation timestamp

### explore_messages
Stores individual messages within a session.
- id: uuid primary key
- session_id: foreign key to explore_sessions
- user_id: owner, defaults to auth.uid()
- role: 'user' or 'bot'
- content: message text
- created_at: message timestamp, used for ordering

## Security
- RLS enabled on both tables.
- All 4 CRUD policies per table, scoped to authenticated users owning the row.
- user_id defaults to auth.uid() so clients can omit it on insert.

## Notes
1. Child table explore_messages references explore_sessions with ON DELETE CASCADE,
   so deleting a session removes all its messages automatically.
2. DEFAULT auth.uid() on user_id means the frontend insert call does NOT need
   to include user_id — the database fills it from the authenticated session.
*/

CREATE TABLE IF NOT EXISTS explore_sessions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title      text NOT NULL,
  topic      text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE explore_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_sessions" ON explore_sessions;
CREATE POLICY "select_own_sessions" ON explore_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sessions" ON explore_sessions;
CREATE POLICY "insert_own_sessions" ON explore_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_sessions" ON explore_sessions;
CREATE POLICY "update_own_sessions" ON explore_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_sessions" ON explore_sessions;
CREATE POLICY "delete_own_sessions" ON explore_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS explore_sessions_user_id_created_at
  ON explore_sessions (user_id, created_at DESC);

-- ── Messages ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS explore_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES explore_sessions(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('user','bot')),
  content    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE explore_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_messages" ON explore_messages;
CREATE POLICY "select_own_messages" ON explore_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_messages" ON explore_messages;
CREATE POLICY "insert_own_messages" ON explore_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_messages" ON explore_messages;
CREATE POLICY "update_own_messages" ON explore_messages FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_messages" ON explore_messages;
CREATE POLICY "delete_own_messages" ON explore_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS explore_messages_session_id_created_at
  ON explore_messages (session_id, created_at ASC);
