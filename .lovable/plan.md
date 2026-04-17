

User asks if there's an admin user for this site. Quick read-only DB check — query `user_roles` joined with `profiles` for role='admin'.

# Plan: Check for Admin Users

Run a single query against the connected DB:

```sql
SELECT p.user_id, p.full_name, ur.created_at
FROM user_roles ur
LEFT JOIN profiles p ON p.user_id = ur.user_id
WHERE ur.role = 'admin';
```

Report back:
- How many admin users exist
- Their names / user IDs / when the role was granted
- If none exist, recommend next step (promote an existing user via SQL, since there's no self-serve admin signup)

No code changes. Approve and I'll run it.

