# Viona Bangles

Public storefront and admin for Viona Bangles (Gaya, Bihar). Static HTML/JS + Supabase. Orders go through WhatsApp.

## Files

- `index.html` â€” homepage
- `product.html` â€” product page (`?code=VB-001`)
- `admin.html` â€” site manager (Google sign-in, admin email only)
- `js/config.js` â€” business details + Supabase URL / anon key
- `supabase/setup.sql` â€” tables, RLS, storage, `is_admin()`

## Go live

1. Run `supabase/setup.sql` in the Supabase SQL editor.
2. Authentication â†’ Providers â†’ enable Google. Add the site URL and redirect URLs.
3. Add your admin:

```sql
insert into public.admins (email) values ('you@gmail.com')
on conflict (email) do nothing;
```

4. Confirm `js/config.js` has the project URL and the **anon / publishable** key (not the service role key).
5. Open `admin.html`, sign in, add products and photos.
6. Host the folder on any static host. Set the Google redirect to that origin.

Demo products only show when Supabase is not configured. An empty database shows an empty catalogue, not fake items.
