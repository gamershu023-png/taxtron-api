-- Revoke unnecessary anon-role grants on explore chat tables.
-- RLS policies are scoped TO authenticated only, so anon has no matching
-- policies and cannot access any rows. These grants are dead weight that
-- would become a hole if policies were ever broadened to include anon.

REVOKE ALL ON explore_sessions FROM anon;
REVOKE ALL ON explore_messages FROM anon;
