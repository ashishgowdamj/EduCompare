# Supabase Backend Setup

Follow these steps to bootstrap the Supabase schema and get the app talking to your database.

## 1) Create a Supabase project
- Go to https://supabase.com and create a new project.
- Copy your Project URL and the anon public key from Project Settings → API.
- You will need these in your mobile app `.env` and EAS env.

## 2) Run SQL files in order
In the Supabase Dashboard → SQL Editor, run these files in order:
1. `schema.sql`
2. `policies.sql`
3. `rpc.sql`
4. `seed.sql`

You can paste each file’s contents into the SQL editor and run them, or upload and execute them as scripts.

## 3) Create storage buckets
In Storage → Create new bucket:
- `college-covers` (public)
- `gallery` (public)

These buckets will store cover images and gallery images for colleges.

## 4) Testing via curl
Replace `YOUR-PROJECT` and `YOUR_ANON_KEY` with your values.

Sign up (email/password):
```bash
curl -X POST \
  'https://YOUR-PROJECT.supabase.co/auth/v1/signup' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"email":"tester@example.com","password":"StrongPass123"}'
```

Sign in (get access token):
```bash
curl -X POST \
  'https://YOUR-PROJECT.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"email":"tester@example.com","password":"StrongPass123"}'
```

List colleges (RLS allows public read):
```bash
curl -X GET \
  'https://YOUR-PROJECT.supabase.co/rest/v1/colleges?select=*' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

Search via RPC (server-side function):
```bash
curl -X POST \
  'https://YOUR-PROJECT.supabase.co/rest/v1/rpc/f_search_colleges' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"q":"iit","p_limit":10,"p_offset":0}'
```

## Pitfalls and best practices
- Always use the HTTPS Project URL in apps. HTTP will fail on production devices.
- Never ship the service role key in the mobile app—only use the anon public key.
- Row Level Security (RLS) is enabled; the provided policies allow public read of catalog tables and user-scoped write for favorites/reviews.
- For admin workflows (moderation/catalog edits), add `admin_users` entries and use server-side environments or admin tools.
