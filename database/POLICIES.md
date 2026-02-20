# Row Level Security (RLS) Policies Documentation

## Overview

The Grand Romeo Hotel database now implements Row Level Security (RLS) policies on all tables. These policies control data access at the PostgreSQL level, providing an additional security layer beyond application-level authentication.

## Current Implementation

### Policy Strategy

The current policies allow **full access** for both `anon` (anonymous) and `authenticated` roles. This maintains compatibility with the application-level authentication system while enabling RLS at the database level.

### Why This Approach?

Since the system uses **application-level authentication** (username/password stored in database tables) rather than Supabase Auth, the policies are configured to allow operations through the Supabase anon key while RLS is technically enabled.

## Tables with Policies

All 9 tables have RLS enabled with policies:

1. **admins** - Admin portal user accounts
2. **front_desk** - Front desk portal user accounts  
3. **guests** - Guest portal user accounts and customer data
4. **rooms** - Hotel room inventory
5. **staff** - Hotel employee records
6. **reservations** - Booking records
7. **reservation_room** - Junction table for reservations and rooms
8. **reservation_staff** - Junction table for reservations and staff
9. **payments** - Payment transaction records

## Policy Types

Each table has policies for:

- **SELECT** - Read access
- **INSERT** - Create new records
- **UPDATE** - Modify existing records
- **DELETE** - Remove records
- **ALL** - Combined access (covers all above operations)

## Example Policies

### Admins Table
```sql
CREATE POLICY "Allow all operations on admins for anon" 
ON admins FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);
```

### Rooms Table (with specific SELECT policy)
```sql
CREATE POLICY "Allow read access on rooms for anon" 
ON rooms FOR SELECT 
TO anon 
USING (true);
```

## Future Enhancements

The current policy framework can be enhanced for more granular security:

### Option 1: Migrate to Supabase Auth

Replace application-level auth with Supabase Auth, then update policies:

```sql
-- Example: Guests can only view their own reservations
CREATE POLICY "Guests view own reservations" 
ON reservations FOR SELECT 
TO authenticated 
USING (guest_id = auth.uid()::int);
```

### Option 2: Use Custom JWT Claims

Set custom claims in JWT tokens to identify user roles:

```sql
-- Example: Only admins can delete rooms
CREATE POLICY "Admins delete rooms" 
ON rooms FOR DELETE 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin');
```

### Option 3: Database Functions with Session Variables

Create PostgreSQL functions that check session variables:

```sql
-- Example: Set user context
CREATE FUNCTION set_user_context(role TEXT, user_id INT) 
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.user_role', role, false);
  PERFORM set_config('app.user_id', user_id::text, false);
END;
$$ LANGUAGE plpgsql;

-- Use in policy
CREATE POLICY "User role based access" 
ON guests FOR SELECT 
TO anon 
USING (
  current_setting('app.user_role', true) IN ('admin', 'front_desk') OR
  guest_id = current_setting('app.user_id', true)::int
);
```

## Applying Policies to Existing Database

Run the migration script:

```bash
# In Supabase SQL Editor, run:
database/add_policies.sql
```

Or if setting up from scratch:

```bash
# Run the complete setup:
database/setup.sql
```

## Verifying Policies

Check active policies in your database:

```sql
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Check if RLS is enabled:

```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

## Security Best Practices

1. **Keep Anon Key Secret** - Never commit the Supabase anon key to public repositories
2. **Use Environment Variables** - Store database credentials in `.env` files
3. **Monitor Access Logs** - Regularly review Supabase logs for suspicious activity
4. **Regular Audits** - Periodically review and update policies as requirements change
5. **Test Policies** - Always test policy changes in a development environment first

## Troubleshooting

### Issue: "permission denied for table"

**Cause:** RLS is blocking access due to missing or incorrect policies.

**Solution:** 
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'your_table';

-- Temporarily disable RLS for debugging
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

### Issue: Queries work locally but fail in production

**Cause:** Different Supabase keys or roles between environments.

**Solution:** Ensure you're using the correct anon key and verify policies exist in production:
```sql
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

## Support

For issues or questions:
1. Check the Supabase dashboard Logs section
2. Review the SQL Editor for error details
3. Consult the database/setup.sql file for current schema
4. Test queries directly in the SQL Editor before implementing in app
